import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { processOCR } from "./ocr-utils.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { base64Image, receiptId, contentType } = await req.json();

    if (!base64Image || !receiptId || !contentType) {
      console.error('Missing required fields:', { base64Image: !!base64Image, receiptId: !!receiptId, contentType: !!contentType });
      return new Response(
        JSON.stringify({ error: 'חסרים שדות נדרשים' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log('Processing receipt:', { receiptId, contentType });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
      // Process with OCR
      console.log('Starting OCR processing...');
      const { items, total, storeName } = await processOCR(base64Image, contentType);

      // Update receipt with store name and total
      const { error: updateError } = await supabase
        .from('receipts')
        .update({ 
          store_name: storeName || 'חנות לא ידועה',
          total: total || 0
        })
        .eq('id', receiptId);

      if (updateError) {
        console.error('Error updating receipt:', updateError);
        throw new Error('שגיאה בעדכון פרטי הקבלה');
      }

      // Insert items
      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from('receipt_items')
          .insert(items.map(item => ({
            receipt_id: receiptId,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1
          })));

        if (itemsError) {
          console.error('Error inserting items:', itemsError);
          throw new Error('שגיאה בשמירת פריטי הקבלה');
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          items, 
          total, 
          storeName,
          message: `זוהו ${items.length} פריטים בקבלה`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (error) {
      console.error('Error processing receipt:', error);
      
      // Update receipt status to error
      const { error: updateError } = await supabase
        .from('receipts')
        .update({ 
          store_name: error.message || 'שגיאה בעיבוד',
          total: 0
        })
        .eq('id', receiptId);
        
      if (updateError) {
        console.error('Error updating receipt status:', updateError);
      }

      throw error;
    }
  } catch (error) {
    console.error('Error processing receipt:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'שגיאה בעיבוד הקבלה',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});