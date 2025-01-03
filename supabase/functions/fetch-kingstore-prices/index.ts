import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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

    // Find download link
    console.log('Looking for download link...');
    const downloadLink = doc.querySelector('a[href*=".xml"]');
    if (!downloadLink) {
      throw new Error('Download link not found on page');
    }

    const href = downloadLink.getAttribute('href');
    if (!href) {
      throw new Error('Download link href is empty');
    }

    console.log('Found download link:', href);

    // Get store ID from the page
    const storeIdMatch = html.match(/סניף\s*(\d+)/);
    const storeId = storeIdMatch ? storeIdMatch[1] : null;

    if (!storeId) {
      throw new Error('Store ID not found on page');
    }

    console.log('Found store ID:', storeId);

    // Download the XML file
    console.log('Downloading XML file...');
    const xmlResponse = await fetch(href);
    if (!xmlResponse.ok) {
      throw new Error(`Failed to download XML: ${xmlResponse.status} ${xmlResponse.statusText}`);
    }

    const xmlText = await xmlResponse.text();
    console.log('XML file downloaded, length:', xmlText.length);

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

    // Helper function to safely get text content
    const getElementText = (parent: Element, tagName: string): string => {
      const element = parent.querySelector(tagName);
      return element?.textContent?.trim() || '';
    };

    // Transform items to database format
    console.log('Processing items...');
    const productsToImport = items.map(item => ({
      store_chain: 'קינג סטור',
      store_id: storeId,
      PriceUpdateDate: getElementText(item, 'PriceUpdateDate') || new Date().toISOString(),
      ItemCode: getElementText(item, 'ItemCode'),
      ItemType: getElementText(item, 'ItemType'),
      ItemName: getElementText(item, 'ItemName'),
      ManufacturerName: getElementText(item, 'ManufacturerName'),
      ManufactureCountry: getElementText(item, 'ManufactureCountry'),
      ManufacturerItemDescription: getElementText(item, 'ManufacturerItemDescription'),
      UnitQty: getElementText(item, 'UnitQty'),
      Quantity: parseFloat(getElementText(item, 'Quantity')) || null,
      UnitOfMeasure: getElementText(item, 'UnitOfMeasure'),
      bIsWeighted: getElementText(item, 'bIsWeighted') === 'true',
      QtyInPackage: parseFloat(getElementText(item, 'QtyInPackage')) || null,
      ItemPrice: parseFloat(getElementText(item, 'ItemPrice')) || null,
      UnitOfMeasurePrice: parseFloat(getElementText(item, 'UnitOfMeasurePrice')) || null,
      AllowDiscount: getElementText(item, 'AllowDiscount') === 'true',
      ItemStatus: getElementText(item, 'ItemStatus')
    }));

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