import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { parseXMLContent } from './xml-parser.ts';
import { mapProductData } from './product-mapper.ts';
import { insertProducts } from './db-operations.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Start processing request ===');
    console.log('Method:', req.method);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));

    // Get form data
    const formData = await req.formData();
    const file = formData.get('file');
    const networkName = formData.get('networkName');
    const branchName = formData.get('branchName');

    console.log('Received data:', {
      hasFile: !!file,
      networkName,
      branchName,
      fileName: file?.name,
      fileSize: file?.size
    });

    if (!networkName || !branchName) {
      throw new Error('חסרים פרטי רשת וסניף');
    }

    if (!file) {
      throw new Error('לא נבחר קובץ');
    }

    // Read file content
    const xmlContent = await file.text();
    console.log('File content length:', xmlContent.length);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create upload record
    const { data: uploadRecord, error: uploadError } = await supabase
      .from('price_file_uploads')
      .insert({
        filename: file.name,
        store_chain: networkName,
        status: 'processing',
        total_chunks: 1,
        created_by: req.headers.get('authorization')?.split(' ')[1] // Get user ID from token
      })
      .select()
      .single();

    if (uploadError) {
      console.error('Upload record creation error:', uploadError);
      throw uploadError;
    }

    console.log('Upload record created:', uploadRecord);

    try {
      // Parse XML content
      const items = await parseXMLContent(xmlContent);
      console.log(`Parsed ${items.length} items from XML`);

      // Map items to product data
      const products = items
        .map(item => mapProductData(item))
        .filter(product => product !== null)
        .map(product => ({
          ...product,
          store_chain: networkName,
          store_id: branchName
        }));

      console.log(`Mapped ${products.length} valid products`);

      // Insert products into database
      const insertedCount = await insertProducts(products);
      console.log(`Successfully inserted ${insertedCount} products`);

      // Update upload record status
      const { error: updateError } = await supabase
        .from('price_file_uploads')
        .update({
          status: 'completed',
          processed_chunks: 1,
          completed_at: new Date().toISOString()
        })
        .eq('id', uploadRecord.id);

      if (updateError) {
        console.error('Error updating upload status:', updateError);
        throw updateError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          uploadId: uploadRecord.id,
          message: `Successfully processed ${insertedCount} products`
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      // Update upload record with error status
      const { error: updateError } = await supabase
        .from('price_file_uploads')
        .update({
          status: 'error',
          error_log: { error: error.message },
          completed_at: new Date().toISOString()
        })
        .eq('id', uploadRecord.id);

      if (updateError) {
        console.error('Error updating upload status:', updateError);
      }

      throw error;
    }
  } catch (error) {
    console.error('Processing error:', {
      message: error.message,
      type: error.constructor.name,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});