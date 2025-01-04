import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { parse } from 'https://deno.land/x/xml@2.1.1/mod.ts';

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
    console.log('Starting Bareket price fetch operation...');

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create a price update record
    const { data: priceUpdate, error: updateError } = await supabase
      .from('price_updates')
      .insert({
        status: 'processing',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to create price update record: ${updateError.message}`);
    }

    // Create temporary directory for dumps
    const dumpsDir = await Deno.makeTempDir({ prefix: 'bareket-dumps-' });
    console.log('Created temporary dumps directory:', dumpsDir);

    try {
      // Read files from dumps directory
      let processedProducts = 0;
      let totalProducts = 0;

      for await (const entry of Deno.readDir(dumpsDir)) {
        if (entry.isFile && entry.name.toLowerCase().includes('bareket') && entry.name.endsWith('.xml')) {
          console.log(`Processing file: ${entry.name}`);
          
          const content = await Deno.readTextFile(`${dumpsDir}/${entry.name}`);
          const xmlData = parse(content);

          if (!xmlData?.Items?.Item) {
            console.warn(`No items found in ${entry.name}`);
            continue;
          }

          const items = Array.isArray(xmlData.Items.Item) 
            ? xmlData.Items.Item 
            : [xmlData.Items.Item];

          totalProducts += items.length;

          // Process items in batches
          const batchSize = 500;
          for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, Math.min(i + batchSize, items.length));
            
            const products = batch.map(item => ({
              store_chain: 'Bareket',
              store_id: item.StoreId?._text || 'unknown',
              store_address: item.StoreAddress?._text,
              ItemCode: item.ItemCode?._text,
              ItemType: item.ItemType?._text,
              ItemName: item.ItemName?._text,
              ManufacturerName: item.ManufacturerName?._text,
              ManufactureCountry: item.ManufactureCountry?._text,
              ManufacturerItemDescription: item.ManufacturerItemDescription?._text,
              UnitQty: item.UnitQty?._text,
              Quantity: parseFloat(item.Quantity?._text || '0'),
              bIsWeighted: item.bIsWeighted?._text === 'true',
              UnitOfMeasure: item.UnitOfMeasure?._text,
              QtyInPackage: parseFloat(item.QtyInPackage?._text || '0'),
              ItemPrice: parseFloat(item.ItemPrice?._text || '0'),
              UnitOfMeasurePrice: parseFloat(item.UnitOfMeasurePrice?._text || '0'),
              AllowDiscount: item.AllowDiscount?._text === 'true',
              ItemStatus: item.ItemStatus?._text,
              PriceUpdateDate: new Date().toISOString()
            }));

            const { error: insertError } = await supabase
              .from('store_products_import')
              .insert(products);

            if (insertError) {
              throw new Error(`Failed to insert products: ${insertError.message}`);
            }

            processedProducts += products.length;
            
            // Update progress
            await supabase
              .from('price_updates')
              .update({
                processed_products: processedProducts,
                total_products: totalProducts
              })
              .eq('id', priceUpdate.id);
          }
        }
      }

      // Mark update as completed
      const { error: completeError } = await supabase
        .from('price_updates')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          processed_products: processedProducts,
          total_products: totalProducts
        })
        .eq('id', priceUpdate.id);

      if (completeError) {
        throw new Error(`Failed to complete price update: ${completeError.message}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully processed ${processedProducts} products from Bareket`,
          updateId: priceUpdate.id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } finally {
      // Clean up temporary directory
      try {
        await Deno.remove(dumpsDir, { recursive: true });
        console.log('Cleaned up temporary directory');
      } catch (cleanupError) {
        console.error('Error cleaning up temporary directory:', cleanupError);
      }
    }

  } catch (error) {
    console.error('Error processing Bareket prices:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to process Bareket prices',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});