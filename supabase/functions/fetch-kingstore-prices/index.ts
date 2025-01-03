import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { xml2js } from "https://deno.land/x/xml2js@v0.5.2/mod.ts";
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

      // Parse XML to JS object
      const result = await xml2js(xmlText, { explicitArray: false });
      
      // Transform data for database
      const items = Array.isArray(result.Root.Items.Item) 
        ? result.Root.Items.Item 
        : [result.Root.Items.Item];

      console.log(`Processing ${items.length} items`);

      // Prepare data for import
      const productsToImport = items.map(item => ({
        store_chain: 'קינג סטור',
        store_id: storeId,
        PriceUpdateDate: item.PriceUpdateDate || new Date().toISOString(),
        ItemCode: item.ItemCode,
        ItemType: item.ItemType,
        ItemName: item.ItemName,
        ManufacturerName: item.ManufacturerName,
        ManufactureCountry: item.ManufactureCountry,
        ManufacturerItemDescription: item.ManufacturerItemDescription,
        UnitQty: item.UnitQty,
        Quantity: parseFloat(item.Quantity) || null,
        UnitOfMeasure: item.UnitOfMeasure,
        bIsWeighted: item.bIsWeighted === 'true',
        QtyInPackage: parseFloat(item.QtyInPackage) || null,
        ItemPrice: parseFloat(item.ItemPrice) || null,
        UnitOfMeasurePrice: parseFloat(item.UnitOfMeasurePrice) || null,
        AllowDiscount: item.AllowDiscount === 'true',
        ItemStatus: item.ItemStatus
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