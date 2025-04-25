import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { processDocumentAI } from "./ocr-utils.ts"

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
    console.log('Processing receipt request...');
    const { base64Image, receiptId, contentType, isPDF } = await req.json();

    if (!base64Image || !receiptId || !contentType) {
      console.error('Missing required fields:', {
        hasBase64: !!base64Image,
        hasReceiptId: !!receiptId,
        hasContentType: !!contentType
      });

      return new Response(
        JSON.stringify({ error: 'חסרים שדות נדרשים' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    try {
      console.log('Starting Document AI processing for receipt:', receiptId);
      const { items, total, storeName } = await processDocumentAI(base64Image, contentType, isPDF);
      console.log('Document AI processing completed:', { itemsCount: items?.length, total, storeName });

      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase configuration');
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      const formattedTotal = Math.min(9999999999.99, Math.max(0, Number(total) || 0));

      console.log('Updating receipt details in database:', {
        receiptId,
        storeName,
        formattedTotal
      });

      const { error: updateError } = await supabase
        .from('receipts')
        .update({
          store_name: storeName || 'חנות לא ידועה',
          total: formattedTotal
        })
        .eq('id', receiptId);

      if (updateError) {
        console.error('Error updating receipt:', updateError);
        throw new Error(`שגיאה בעדכון פרטי הקבלה: ${updateError.message}`);
      }

      if (items && items.length > 0) {
        console.log('Processing receipt items:', items.length);

        const validItems = items
          .filter(item =>
            item.name &&
            typeof item.price === 'number' &&
            (typeof item.quantity === 'number' || item.quantity === null)
          )
          .map(item => ({
            receipt_id: receiptId,
            name: item.name,
            price: Math.min(9999999999.99, Math.max(0, Number(item.price) || 0)),
            quantity: Math.min(9999999999.99, Math.max(0, Number(item.quantity) || 1)),
            product_code: item.product_code  // Added product code
          }));

        if (validItems.length > 0) {
          console.log('Inserting valid items:', validItems);
          const { error: itemsError } = await supabase
            .from('receipt_items')
            .insert(validItems);

          if (itemsError) {
            console.error('Error inserting items:', itemsError);
            throw new Error(`שגיאה בשמירת פריטי הקבלה: ${itemsError.message}`);
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          items: items || [],
          total: formattedTotal,
          storeName,
          message: `זוהו ${items?.length || 0} פריטים בקבלה`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (error) {
      console.error('Error in Document AI processing:', error);

      // Initialize Supabase client for error update
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Update receipt status to error
        const { error: updateError } = await supabase
          .from('receipts')
          .update({
            store_name: error instanceof Error ? error.message : 'שגיאה בעיבוד',
            total: 0
          })
          .eq('id', receiptId);

        if (updateError) {
          console.error('Error updating receipt status:', updateError);
        }
      }

      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'שגיאה בעיבוד הקבלה',
          details: error.toString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({
        error: 'שגיאה בעיבוד הבקשה',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
