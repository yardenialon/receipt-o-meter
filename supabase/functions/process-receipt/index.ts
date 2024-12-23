import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { processOCR } from "./ocr-utils.ts"
import { updateReceiptStatus, insertReceiptItems } from "./db-utils.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting receipt processing...');
    
    // Get form data once and store it
    const formData = await req.formData();
    const file = formData.get('file');
    const receiptId = formData.get('receiptId');

    if (!file || !receiptId || typeof receiptId !== 'string') {
      console.error('Missing required fields:', { file: !!file, receiptId });
      throw new Error('Missing required fields');
    }

    console.log('Processing receipt:', { receiptId });

    // Convert file to base64
    const buffer = await (file as File).arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    // Process with OCR
    console.log('Calling OCR API...');
    const { items, total, storeName } = await processOCR(base64, (file as File).type);

    // Update receipt status
    console.log('Updating receipt status:', { storeName, total });
    await updateReceiptStatus(receiptId, {
      store_name: storeName || 'חנות לא ידועה',
      total: total || 0
    });

    // Insert items if any were found
    if (items.length > 0) {
      console.log('Inserting receipt items:', items.length);
      await insertReceiptItems(receiptId, items);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        items, 
        total, 
        storeName,
        message: items.length > 0 ? 
          `זוהו ${items.length} פריטים בקבלה` : 
          'לא זוהו פריטים בקבלה'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error processing receipt:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    );
  }
});