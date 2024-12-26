import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { gunzip } from "https://deno.land/x/compress@v0.4.5/gzip/mod.ts";
import { parse as xmlParse } from "https://deno.land/x/xml@2.1.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting Shufersal price fetch...');
    
    // Fetch the price files list with proper headers
    const response = await fetch('https://prices.shufersal.co.il/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch price files list:', response.status, response.statusText);
      throw new Error(`Failed to fetch price files list: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log('Received HTML response:', html.substring(0, 500)); // Log first 500 chars for debugging

    // Look for .gz files in the HTML response
    const gzFiles = html.match(/href="([^"]*\.gz)"/g);
    console.log('Found .gz files:', gzFiles);

    if (!gzFiles || gzFiles.length === 0) {
      throw new Error('No price files found in the HTML response');
    }

    // Get the most recent file (usually the last one in the list)
    const mostRecentFile = gzFiles[gzFiles.length - 1].match(/href="([^"]*\.gz)"/)[1];
    const fileUrl = `https://prices.shufersal.co.il/${mostRecentFile}`;
    console.log('Fetching file:', fileUrl);

    // Download the .gz file with proper headers
    const gzResponse = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
      }
    });

    if (!gzResponse.ok) {
      console.error('Failed to fetch .gz file:', gzResponse.status, gzResponse.statusText);
      throw new Error('Failed to fetch .gz file');
    }

    // Convert response to ArrayBuffer and decompress
    const gzBuffer = await gzResponse.arrayBuffer();
    const decompressed = gunzip(new Uint8Array(gzBuffer));
    const xmlText = new TextDecoder().decode(decompressed);

    // Parse XML
    const data = xmlParse(xmlText);
    const items = data.Items?.Item || [];

    if (!items.length) {
      throw new Error('No items found in the XML file');
    }

    console.log(`Found ${items.length} items in the XML file`);

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
        store_id: item.StoreId?.[0] || null,
        product_code: item.ItemCode?.[0] || '',
        product_name: item.ItemName?.[0] || '',
        manufacturer: item.ManufacturerName?.[0] || null,
        price: parseFloat(item.ItemPrice?.[0] || '0'),
        unit_quantity: item.UnitQty?.[0] || null,
        unit_of_measure: item.UnitMeasure?.[0] || null,
        price_update_date: new Date().toISOString(),
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
        message: `Successfully processed ${successCount} items` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})