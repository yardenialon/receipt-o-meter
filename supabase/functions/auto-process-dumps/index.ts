import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { gunzip } from "https://deno.land/x/compress@v0.4.5/gzip/mod.ts";
import { parse } from 'https://deno.land/x/xml@2.1.1/mod.ts';
import { corsHeaders } from './utils/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting automated dumps processing...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create a record for this price update operation
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

    // Run the Docker command to fetch prices
    const dockerCommand = [
      'docker',
      'run',
      '--rm',
      '-v',
      `${Deno.cwd()}/dumps:/usr/src/app/dumps`,
      '-e',
      'ENABLED_SCRAPERS=SHUFERSAL,RAMI_LEVY,BAREKET',
      '-e',
      'ENABLED_FILE_TYPES=STORE_FILE',
      'erlichsefi/israeli-supermarket-scarpers:latest'
    ];

    console.log('Running Docker command:', dockerCommand.join(' '));
    
    const process = new Deno.Command(dockerCommand[0], {
      args: dockerCommand.slice(1),
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code, stdout, stderr } = await process.output();
    const outStr = new TextDecoder().decode(stdout);
    const errStr = new TextDecoder().decode(stderr);
    
    console.log('Docker output:', outStr);
    if (errStr) console.error('Docker errors:', errStr);

    if (code !== 0) {
      throw new Error(`Docker process failed with code ${code}`);
    }

    // Process the downloaded files
    let totalProducts = 0;
    const dumpsDir = `${Deno.cwd()}/dumps`;
    
    for await (const entry of Deno.readDir(dumpsDir)) {
      if (entry.isFile && (entry.name.endsWith('.xml') || entry.name.endsWith('.gz'))) {
        console.log(`Processing file: ${entry.name}`);
        
        try {
          const fileContent = await Deno.readFile(`${dumpsDir}/${entry.name}`);
          let xmlContent: string;

          if (entry.name.endsWith('.gz')) {
            const decompressed = gunzip(fileContent);
            xmlContent = new TextDecoder().decode(decompressed);
          } else {
            xmlContent = new TextDecoder().decode(fileContent);
          }

          const xmlData = parse(xmlContent);
          let items = xmlData?.root?.Items?.Item || xmlData?.Items?.Item || [];
          items = Array.isArray(items) ? items : [items].filter(Boolean);

          if (items.length === 0) {
            console.warn(`No items found in file: ${entry.name}`);
            continue;
          }

          // Extract store info from filename
          const storeName = entry.name.split('_')[0].toLowerCase();
          const storeChain = storeName.charAt(0).toUpperCase() + storeName.slice(1);

          const products = items.map(item => ({
            store_chain: storeChain,
            store_id: item.StoreId?._text || '001',
            product_code: item.ItemCode?._text,
            product_name: item.ItemName?._text,
            manufacturer: item.ManufacturerName?._text,
            price: parseFloat(item.ItemPrice?._text || '0'),
            unit_quantity: item.UnitQty?._text,
            unit_of_measure: item.UnitOfMeasure?._text,
            item_type: item.ItemType?._text,
            manufacture_country: item.ManufactureCountry?._text,
            manufacturer_item_description: item.ManufacturerItemDescription?._text,
            quantity: parseFloat(item.Quantity?._text || '0'),
            is_weighted: item.bIsWeighted?._text === 'true',
            qty_in_package: parseFloat(item.QtyInPackage?._text || '0'),
            unit_of_measure_price: parseFloat(item.UnitOfMeasurePrice?._text || '0'),
            allow_discount: item.AllowDiscount?._text === 'true',
            item_status: item.ItemStatus?._text,
            price_update_date: new Date().toISOString()
          }));

          // Insert products in batches
          const batchSize = 1000;
          for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            const { error: insertError } = await supabase
              .from('store_products')
              .upsert(batch, {
                onConflict: 'product_code,store_chain',
                ignoreDuplicates: false
              });

            if (insertError) {
              throw new Error(`Failed to insert products batch: ${insertError.message}`);
            }

            totalProducts += batch.length;
            
            // Update progress
            await supabase
              .from('price_updates')
              .update({
                processed_products: totalProducts,
                total_products: products.length
              })
              .eq('id', priceUpdate.id);
          }

          console.log(`Successfully processed ${products.length} products from ${entry.name}`);
          
          // Clean up the processed file
          await Deno.remove(`${dumpsDir}/${entry.name}`);
          
        } catch (error) {
          console.error(`Error processing file ${entry.name}:`, error);
          throw error;
        }
      }
    }

    // Mark the update as completed
    await supabase
      .from('price_updates')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_products: totalProducts,
        processed_products: totalProducts
      })
      .eq('id', priceUpdate.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${totalProducts} products`,
        updateId: priceUpdate.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in dumps processing:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});