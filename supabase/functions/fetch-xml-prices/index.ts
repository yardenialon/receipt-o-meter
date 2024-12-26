import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { parse as xmlParse } from "https://deno.land/x/xml@2.1.1/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    console.log('Received XML content length:', xmlContent.length);
    
    // Clean up the XML content
    let cleanXmlContent = xmlContent
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    // Parse XML
    console.log('Parsing XML content...');
    let data;
    try {
      data = xmlParse(cleanXmlContent);
      console.log('XML parsed successfully');
      console.log('Items count:', data.root?.Items?.['@Count']);
    } catch (parseError) {
      console.error('XML Parse Error:', parseError);
      throw new Error('שגיאה בפרסור ה-XML: ' + parseError.message);
    }

    // Extract items from the XML structure
    const items = data?.root?.Items?.Item;
    console.log('Items array found:', Array.isArray(items));
    console.log('Items length:', items?.length);
    
    if (!items || !Array.isArray(items) || items.length === 0) {
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

    const storeChain = 'שופרסל';
    const storeId = data.root?.StoreId || '001';

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize).map(item => {
        const product = {
          store_chain: storeChain,
          store_id: storeId,
          product_code: item.ItemCode,
          product_name: item.ItemName,
          manufacturer: item.ManufacturerName,
          price: parseFloat(item.ItemPrice),
          unit_quantity: item.Quantity,
          unit_of_measure: item.UnitOfMeasure,
          price_update_date: item.PriceUpdateDate 
            ? new Date(item.PriceUpdateDate).toISOString()
            : new Date().toISOString(),
          category: null
        };

        if (i === 0) {
          console.log('Sample product data:', product);
        }

        return product;
      });

      console.log(`Processing batch ${i/batchSize + 1}, items ${i} to ${i + batch.length}`);

      const { error } = await supabase
        .from('store_products')
        .upsert(batch, {
          onConflict: 'product_code,store_chain',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error inserting batch:', error);
        throw error;
      } else {
        successCount += batch.length;
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