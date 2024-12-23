import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, processOCR } from "./ocr-utils.ts";
import { updateReceiptStatus, insertReceiptItems } from "./db-utils.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting receipt processing...');
    const formData = await req.formData();
    const file = formData.get('file');
    const receiptId = formData.get('receiptId');

    if (!file || !receiptId || typeof receiptId !== 'string') {
      throw new Error('Missing file or receipt ID');
    }

    console.log('Processing receipt:', { receiptId });

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    console.log('Calling OCR API...');
    const { items, total, storeName } = await processOCR(base64, file.type);

    // Update receipt with results
    await updateReceiptStatus(receiptId, {
      store_name: storeName || 'חנות לא ידועה',
      total: total || 0
    });

    // Insert items if any were found
    if (items.length > 0) {
      await insertReceiptItems(receiptId, items);
    }

    console.log('Receipt processing completed successfully');
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

    // Try to update receipt status to error state if we have the receipt ID
    try {
      const receiptId = await req.formData().then(form => form.get('receiptId'));
      if (receiptId && typeof receiptId === 'string') {
        await updateReceiptStatus(receiptId, {
          store_name: 'שגיאה בעיבוד',
          total: 0
        });
      }
    } catch (updateError) {
      console.error('Error updating receipt status:', updateError);
    }

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