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
    
    // Get the request body
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { base64Image, receiptId, contentType } = body;

    if (!base64Image || !receiptId || !contentType) {
      console.error('Missing required fields:', { 
        hasBase64: !!base64Image, 
        hasReceiptId: !!receiptId, 
        hasContentType: !!contentType 
      });
      throw new Error('Missing required fields');
    }

    console.log('Processing receipt:', { receiptId, contentType });

    // Process with OCR
    console.log('Calling OCR API...');
    const { items, total, storeName } = await processOCR(base64Image, contentType);

    // Update receipt status
    console.log('Updating receipt status:', { storeName, total });
    await updateReceiptStatus(receiptId, {
      store_name: storeName || 'חנות לא ידועה',
      total: total || 0
    });

    // Insert items if any were found
    if (items && items.length > 0) {
      console.log('Inserting receipt items:', items.length);
      await insertReceiptItems(receiptId, items);
    } else {
      console.log('No items found in receipt');
      await updateReceiptStatus(receiptId, {
        store_name: 'לא זוהו פריטים',
        total: 0
      });
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
        },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error processing receipt:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
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