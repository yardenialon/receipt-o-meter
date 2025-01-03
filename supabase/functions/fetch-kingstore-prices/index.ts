import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
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

    // Launch browser
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('Browser launched');
    
    try {
      const page = await browser.newPage();
      
      // Navigate to the page
      await page.goto('https://kingstore.binaprojects.com/Main.aspx');
      console.log('Navigated to King Store page');

      // Wait for and click the download link
      const downloadLink = await page.waitForSelector('a:contains("להורדה לחץ כאן")');
      if (!downloadLink) {
        throw new Error('Download link not found');
      }

      // Get the href attribute
      const href = await downloadLink.evaluate(el => el.getAttribute('href'));
      if (!href) {
        throw new Error('Download link href not found');
      }

      // Get the store ID from the branch name column
      const branchCell = await page.$('td:contains("סניף")');
      const storeId = await branchCell?.evaluate(el => {
        const text = el.textContent;
        const match = text.match(/סניף\s*(\d+)/);
        return match ? match[1] : null;
      });

      if (!storeId) {
        throw new Error('Store ID not found');
      }

      console.log('Found store ID:', storeId);

      // Download the XML file
      const response = await fetch(href);
      const xmlText = await response.text();
      
      console.log('Downloaded XML file');

      // Parse XML using DOMParser
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      if (!xmlDoc) {
        throw new Error('Failed to parse XML');
      }

      // Get all Item elements
      const items = Array.from(xmlDoc.querySelectorAll('Items > Item'));
      
      if (!items || items.length === 0) {
        throw new Error('No items found in XML');
      }

      console.log(`Processing ${items.length} items`);

      // Helper function to safely get text content
      const getElementText = (parent: Element, tagName: string): string => {
        const element = parent.querySelector(tagName);
        return element?.textContent?.trim() || '';
      };

      // Transform items to database format
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
      const BATCH_SIZE = 1000;
      for (let i = 0; i < productsToImport.length; i += BATCH_SIZE) {
        const batch = productsToImport.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
          .from('store_products_import')
          .insert(batch);

        if (error) {
          console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
          throw error;
        }

        console.log(`Inserted batch ${i / BATCH_SIZE + 1} of ${Math.ceil(productsToImport.length / BATCH_SIZE)}`);
      }

      console.log('Data import completed successfully');

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Price data imported successfully',
          itemsProcessed: productsToImport.length 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } finally {
      await browser.close();
    }

  } catch (error) {
    console.error('Error:', error);
    
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