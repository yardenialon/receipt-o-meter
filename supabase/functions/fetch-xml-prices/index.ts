import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== Start processing request ===');
    console.log('Method:', req.method);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));

    // Get metadata from headers
    const networkName = req.headers.get('x-network-name');
    const branchName = req.headers.get('x-branch-name');
    const fileName = req.headers.get('x-file-name');

    if (!networkName || !branchName || !fileName) {
      throw new Error('Missing required metadata in headers');
    }

    // Read raw XML content
    const xmlContent = await req.text();
    console.log('Raw data received:', {
      length: xmlContent.length,
      preview: xmlContent.substring(0, 200),
      networkName,
      branchName,
      fileName
    });

    if (!xmlContent || xmlContent.trim().length === 0) {
      throw new Error('No XML content provided');
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create upload record
    const { data: uploadRecord, error: uploadError } = await supabase
      .from('price_file_uploads')
      .insert({
        filename: fileName,
        store_chain: networkName,
        status: 'processing',
        total_chunks: 1
      })
      .select()
      .single();

    if (uploadError) {
      console.error('Upload record creation error:', uploadError);
      throw uploadError;
    }

    console.log('Upload record created:', uploadRecord);

    return new Response(
      JSON.stringify({
        success: true,
        uploadId: uploadRecord.id,
        message: 'File processing started'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

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