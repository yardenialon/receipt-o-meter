import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { format } from "https://deno.land/std@0.190.0/datetime/format.ts";
import { gunzip } from "https://deno.land/x/compress@v0.4.5/gzip/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting King Store price fetch...');

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the King Store page
    console.log('Fetching King Store page...');
    const response = await fetch('https://kingstore.binaprojects.com/Main.aspx');
    if (!response.ok) {
      throw new Error(`Failed to fetch King Store page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log('Successfully loaded King Store page');

    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    if (!doc) {
      throw new Error('Failed to parse HTML document');
    }

    // Get current date in DD/MM/YYYY format
    const today = new Date();
    const formattedDate = format(today, 'dd/MM/yyyy');
    console.log('Looking for files with today\'s date:', formattedDate);

    // Find all links in the table
    const links = doc.querySelectorAll('a[href*=".gz"]');
    let targetLink = null;

    for (const link of links) {
      const row = link.closest('tr');
      if (!row) continue;

      const cells = row.querySelectorAll('td');
      if (cells.length < 4) continue;

      const fileName = cells[0]?.textContent?.trim() || '';
      const fileDate = cells[3]?.textContent?.trim() || '';

      console.log('Checking file:', fileName, 'Date:', fileDate);

      if (fileName.startsWith('PriceFull') && fileDate === formattedDate) {
        targetLink = link.getAttribute('href');
        console.log('Found matching file:', fileName);
        break;
      }
    }

    if (!targetLink) {
      throw new Error('No matching price file found for today');
    }

    // Download the GZ file
    console.log('Downloading GZ file...');
    const gzResponse = await fetch(targetLink);
    if (!gzResponse.ok) {
      throw new Error(`Failed to download GZ file: ${gzResponse.status} ${gzResponse.statusText}`);
    }

    // Get the GZ file content as ArrayBuffer
    const gzBuffer = await gzResponse.arrayBuffer();
    console.log('GZ file downloaded, size:', gzBuffer.byteLength);

    // Decompress GZ file
    console.log('Decompressing GZ file...');
    const decompressed = gunzip(new Uint8Array(gzBuffer));
    const xmlText = new TextDecoder().decode(decompressed);
    console.log('XML file extracted, length:', xmlText.length);

    // Parse XML
    console.log('Parsing XML...');
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    if (!xmlDoc) {
      throw new Error('Failed to parse XML document');
    }

    // Get all Item elements
    const items = Array.from(xmlDoc.querySelectorAll('Items > Item'));
    if (!items || items.length === 0) {
      throw new Error('No items found in XML document');
    }

    console.log(`Found ${items.length} items in XML`);

    // Get store ID from the page
    const storeIdMatch = html.match(/סניף\s*(\d+)/);
    const storeId = storeIdMatch ? storeIdMatch[1] : null;

    if (!storeId) {
      throw new Error('Store ID not found on page');
    }

    console.log('Found store ID:', storeId);

    // Transform items to database format
    console.log('Processing items...');
    const productsToImport = items.map(item => {
      const getElementText = (tagName: string): string => {
        const element = item.querySelector(tagName);
        return element?.textContent?.trim() || '';
      };

      return {
        store_chain: 'קינג סטור',
        store_id: storeId,
        PriceUpdateDate: getElementText('PriceUpdateDate') || new Date().toISOString(),
        ItemCode: getElementText('ItemCode'),
        ItemType: getElementText('ItemType'),
        ItemName: getElementText('ItemName'),
        ManufacturerName: getElementText('ManufacturerName'),
        ManufactureCountry: getElementText('ManufactureCountry'),
        ManufacturerItemDescription: getElementText('ManufacturerItemDescription'),
        UnitQty: getElementText('UnitQty'),
        Quantity: parseFloat(getElementText('Quantity')) || null,
        bIsWeighted: getElementText('bIsWeighted') === 'true',
        UnitOfMeasure: getElementText('UnitOfMeasure'),
        QtyInPackage: parseFloat(getElementText('QtyInPackage')) || null,
        ItemPrice: parseFloat(getElementText('ItemPrice')) || null,
        UnitOfMeasurePrice: parseFloat(getElementText('UnitOfMeasurePrice')) || null,
        AllowDiscount: getElementText('AllowDiscount') === 'true',
        ItemStatus: getElementText('ItemStatus')
      };
    });

    // Insert data in batches
    const BATCH_SIZE = 500;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < productsToImport.length; i += BATCH_SIZE) {
      const batch = productsToImport.slice(i, i + BATCH_SIZE);
      try {
        const { error } = await supabase
          .from('store_products_import')
          .insert(batch);

        if (error) {
          console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
          errorCount++;
        } else {
          successCount++;
          console.log(`Successfully inserted batch ${i / BATCH_SIZE + 1} of ${Math.ceil(productsToImport.length / BATCH_SIZE)}`);
        }
      } catch (error) {
        console.error(`Failed to insert batch ${i / BATCH_SIZE + 1}:`, error);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Price data imported successfully',
        itemsProcessed: productsToImport.length,
        successfulBatches: successCount,
        failedBatches: errorCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Fatal error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});