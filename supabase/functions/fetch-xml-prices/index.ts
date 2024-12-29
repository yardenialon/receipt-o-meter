import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Helper function to split string into chunks
function* chunkString(str: string, size: number) {
  for (let i = 0; i < str.length; i += size) {
    yield str.slice(i, i + size);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting file processing...');
    
    // Parse the request body once
    const { fileContent: base64Content, networkName, branchName } = await req.json();
    
    if (!base64Content) {
      throw new Error('No file content provided');
    }

    // Decode base64 content
    const xmlContent = atob(base64Content);
    
    // Split content into smaller chunks
    const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
    const chunks = Array.from(chunkString(xmlContent, CHUNK_SIZE));

    console.log(`File received. Total size: ${xmlContent.length} bytes`);
    console.log(`Split into ${chunks.length} chunks`);

    // Process first chunk to validate content
    const firstChunk = chunks[0];
    console.log('First chunk preview:', firstChunk.substring(0, 200));

    if (!networkName || !branchName) {
      throw new Error('Network name and branch name are required');
    }

    // Create upload record
    const { data: uploadRecord, error: uploadError } = await supabase
      .from('price_file_uploads')
      .insert({
        filename: 'xml-upload',
        store_chain: networkName,
        total_chunks: chunks.length,
        status: 'pending'
      })
      .select()
      .single();

    if (uploadError) {
      throw uploadError;
    }

    // Create chunk records
    const chunkRecords = chunks.map((_, index) => ({
      upload_id: uploadRecord.id,
      chunk_index: index,
      status: 'pending'
    }));

    const { error: chunksError } = await supabase
      .from('price_upload_chunks')
      .insert(chunkRecords);

    if (chunksError) {
      throw chunksError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        uploadId: uploadRecord.id,
        fileSize: xmlContent.length,
        numChunks: chunks.length,
        firstChunkPreview: firstChunk.substring(0, 100)
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
        error: error.message || 'Unknown error',
        errorDetails: error.stack
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});