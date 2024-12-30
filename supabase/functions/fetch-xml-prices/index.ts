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
    console.log('Processing request...');
    const formData = await req.formData();
    const file = formData.get('file');
    const networkName = formData.get('networkName');
    const branchName = formData.get('branchName');

    if (!file || !networkName || !branchName) {
      throw new Error('Missing required fields: file, networkName, or branchName');
    }

    console.log('Received data:', {
      hasFile: !!file,
      networkName,
      branchName,
      fileName: file?.name,
      fileSize: file?.size
    });

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user ID from the JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Extract the JWT token and verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Invalid authentication');
    }

    console.log('Authenticated user:', user.id);

    // Create upload record
    const { data: uploadRecord, error: uploadError } = await supabase
      .from('price_file_uploads')
      .insert({
        filename: file.name,
        store_chain: networkName,
        status: 'processing',
        total_chunks: 1,
        created_by: user.id
      })
      .select()
      .single();

    if (uploadError || !uploadRecord) {
      console.error('Upload record creation error:', uploadError);
      throw new Error('Failed to create upload record');
    }

    console.log('Upload record created:', uploadRecord);

    try {
      // Read and parse XML content
      const xmlContent = await file.text();
      console.log('File content length:', xmlContent.length);

      // Parse XML content
      const items = await parseXMLContent(xmlContent);
      console.log(`Parsed ${items.length} items from XML`);

      // Map items to product data
      const products = items
        .map(item => mapProductData(item))
        .filter((product): product is NonNullable<ReturnType<typeof mapProductData>> => product !== null)
        .map(product => ({
          ...product,
          store_chain: networkName,
          store_id: branchName
        }));

      console.log(`Mapped ${products.length} valid products`);

      if (products.length === 0) {
        throw new Error('No valid products found in XML file');
      }

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