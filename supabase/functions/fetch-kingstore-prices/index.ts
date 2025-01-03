import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { gunzip } from "https://deno.land/x/compress@v0.4.5/gzip/mod.ts";
import { mapXmlItemToProduct } from "./product-mapper.ts";
import { insertProducts } from "./db-operations.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting King Store price fetch...');

    // Fetch the King Store page
    const response = await fetch('https://kingstore.binaprojects.com/Main.aspx');
    if (!response.ok) {
      throw new Error(`Failed to fetch King Store page: ${response.status}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    if (!doc) {
      throw new Error('Failed to parse HTML document');
    }

    // Get current date in DD/MM/YYYY format
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    console.log('Looking for files with today\'s date:', formattedDate);

    // Find the correct price file link
    const links = doc.querySelectorAll('a[href*=".gz"]');
    let targetLink = null;

    for (const link of links) {
      const row = link.closest('tr');
      if (!row) continue;

      const cells = row.querySelectorAll('td');
      if (cells.length < 4) continue;

      const fileName = cells[0]?.textContent?.trim() || '';
      const fileDate = cells[3]?.textContent?.trim() || '';

      if (fileName.startsWith('PriceFull') && fileDate === formattedDate) {
        targetLink = link.getAttribute('href');
        console.log('Found matching file:', fileName);
        break;
      }
    }

    if (!targetLink) {
      throw new Error('No matching price file found for today');
    }

    // Download and process the GZ file
    console.log('Downloading GZ file from:', targetLink);
    const gzResponse = await fetch(targetLink);
    if (!gzResponse.ok) {
      throw new Error(`Failed to download GZ file: ${gzResponse.status}`);
    }

    const gzBuffer = await gzResponse.arrayBuffer();
    console.log('Decompressing GZ file...');
    const decompressed = gunzip(new Uint8Array(gzBuffer));
    const xmlText = new TextDecoder().decode(decompressed);

    // Parse XML
    console.log('Parsing XML...');
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    if (!xmlDoc) {
      throw new Error('Failed to parse XML document');
    }

    // Process items
    const items = xmlDoc.querySelectorAll('Items > Item');
    console.log(`Found ${items.length} items in XML`);

    if (!items || items.length === 0) {
      throw new Error('No items found in XML');
    }

    // Map items to products and insert them
    const products = Array.from(items).map(mapXmlItemToProduct);
    const insertedCount = await insertProducts(products);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${insertedCount} products`,
        itemsProcessed: insertedCount
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