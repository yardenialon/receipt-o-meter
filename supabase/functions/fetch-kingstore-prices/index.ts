import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { gunzip } from "https://deno.land/x/compress@v0.4.5/gzip/mod.ts";
import { mapXmlItemToProduct } from "./product-mapper.ts";
import { insertProducts } from "./db-operations.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 500;

function formatDateForComparison(dateStr: string): string {
  // Try to extract date in format DD/MM/YYYY
  const dateMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!dateMatch) return '';
  
  // Pad day and month with leading zeros if needed
  const day = dateMatch[1].padStart(2, '0');
  const month = dateMatch[2].padStart(2, '0');
  const year = dateMatch[3];
  
  return `${day}/${month}/${year}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting King Store price fetch...');

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

    const rows = doc.querySelectorAll('tr');
    let targetLink = null;
    let fileName = '';
    const availableDates = new Set<string>();

    for (const row of rows) {
      const cells = row.querySelectorAll('td');
      if (cells.length < 4) continue;

      const fileNameCell = cells[0]?.textContent?.trim() || '';
      const fileDateCell = cells[1]?.textContent?.trim() || '';
      const link = row.querySelector('a[href*=".gz"]')?.getAttribute('href');

      console.log(`Processing row - File: ${fileNameCell}, Raw date: ${fileDateCell}`);

      // Only process PriceFull files
      if (!fileNameCell.startsWith('PriceFull')) {
        continue;
      }

      const normalizedFileDate = formatDateForComparison(fileDateCell);
      if (normalizedFileDate) {
        availableDates.add(normalizedFileDate);
        console.log(`Normalized date for comparison: ${normalizedFileDate}`);
      }

      if (normalizedFileDate === formattedDate && link) {
        console.log(`Found matching file! Date matches: ${normalizedFileDate} = ${formattedDate}`);
        targetLink = link;
        fileName = fileNameCell;
        break;
      }
    }

    if (!targetLink) {
      const availableDatesStr = Array.from(availableDates).join(', ');
      console.log('Available dates:', availableDatesStr);
      throw new Error(`No matching price file found for today (${formattedDate}). Available dates: ${availableDatesStr}`);
    }

    // Download and process the GZ file
    console.log('Downloading GZ file:', targetLink);
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

    // Process items in batches
    const allItems = Array.from(items);
    let processedCount = 0;
    const totalBatches = Math.ceil(allItems.length / BATCH_SIZE);

    for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
      const batch = allItems.slice(i, i + BATCH_SIZE);
      const batchProducts = batch.map(mapXmlItemToProduct);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      
      console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)`);
      const insertedCount = await insertProducts(batchProducts);
      processedCount += insertedCount;
      
      console.log(`Batch ${batchNumber} complete: ${insertedCount} items processed`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${processedCount} products from ${fileName}`,
        itemsProcessed: processedCount
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