import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { parse as xmlParse } from "https://deno.land/x/xml@2.1.1/mod.ts";
import { createClient } from '@supabase/supabase-js';

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
    const { xmlContent } = await req.json();
    
    if (!xmlContent) {
      throw new Error('לא התקבל תוכן XML');
    }

    console.log('Received content length:', xmlContent.length);
    
    // Clean up the XML content
    let cleanXmlContent = xmlContent
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    // Add XML declaration if missing
    if (!cleanXmlContent.includes('<?xml')) {
      console.log('Adding XML declaration to content');
      cleanXmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n' + cleanXmlContent;
    }

    // Parse XML with better error handling
    console.log('Parsing XML content...');
    console.log('First 100 characters:', cleanXmlContent.substring(0, 100));
    
    let data;
    try {
      data = xmlParse(cleanXmlContent);
    } catch (parseError) {
      console.error('XML Parse Error:', parseError);
      throw new Error('שגיאה בפרסור ה-XML: ' + 
        (parseError.message === 'UnexpectedEof' 
          ? 'הקובץ אינו שלם או חסרות תגיות סגירה' 
          : parseError.message));
    }

    // Extract items from the specific XML structure
    const items = data.root?.Items?.[0]?.Item || [];
    console.log(`Found ${items.length} items in the XML content`);

    if (!items.length) {
      throw new Error('לא נמצאו פריטים ב-XML');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Process items in batches
    const batchSize = 100;
    let processed = 0;
    let successCount = 0;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize).map(item => ({
        store_chain: 'שופרסל',
        store_id: data.root?.StoreId?.[0] || '001',
        product_code: item.ItemCode?.[0] || '',
        product_name: item.ItemName?.[0] || '',
        manufacturer: item.ManufacturerName?.[0] || null,
        price: parseFloat(item.ItemPrice?.[0] || '0'),
        unit_quantity: item.Quantity?.[0] || null,
        unit_of_measure: item.UnitOfMeasure?.[0] || null,
        price_update_date: item.PriceUpdateDate?.[0] 
          ? new Date(item.PriceUpdateDate[0]).toISOString()
          : new Date().toISOString(),
        category: null // You might want to add category mapping later
      }));

      const { error } = await supabase
        .from('store_products')
        .upsert(batch, {
          onConflict: 'product_code,store_chain',
          ignoreDuplicates: false
        });

      if (!error) {
        successCount += batch.length;
      } else {
        console.error('Error inserting batch:', error);
      }

      processed += batch.length;
      console.log(`Processed ${processed}/${items.length} items`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${successCount} items`,
        count: successCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'שגיאה בעיבוד ה-XML'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});