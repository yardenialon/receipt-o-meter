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
      console.log('Document AI processing completed:', { itemsCount: items.length, total, storeName });

      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      const supabase = createClient(supabaseUrl, supabaseKey);

      console.log('Updating receipt details in database:', { receiptId, storeName, total });
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

      // Insert items if any were found
      if (items.length > 0) {
        console.log('Inserting receipt items:', items.length);
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
      console.error('Error in Document AI processing:', error);
      
      // Initialize Supabase client for error update
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
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