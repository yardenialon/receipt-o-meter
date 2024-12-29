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
    console.log('Request received');
    const body = await req.json();
    console.log('Request body:', body);

    const { fileContent, networkName, branchName } = body;

    if (!fileContent) {
      console.error('No file content provided');
      throw new Error('No file content provided');
    }

    if (!networkName || !branchName) {
      console.error('Missing network or branch name');
      throw new Error('Network name and branch name are required');
    }

    console.log('Processing file for:', { networkName, branchName });

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create upload record
    const { data: uploadRecord, error: uploadError } = await supabase
      .from('price_file_uploads')
      .insert({
        filename: 'xml-upload',
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
    console.error('Processing error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.stack
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