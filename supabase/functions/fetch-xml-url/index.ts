import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { insertProducts } from "../fetch-xml-prices/db-operations.ts";
import { parse } from "https://deno.land/x/xml@2.1.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 500; // Process 500 items at a time

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, networkName, branchName } = await req.json();
    console.log('Fetching XML from URL:', url);

    if (!url || !networkName || !branchName) {
      throw new Error('חסרים פרטי URL, רשת או סניף');
    }

    // Fetch XML content from URL with streaming
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`שגיאה בהורדת הקובץ: ${response.statusText}`);
    }

    const xmlContent = await response.text();
    console.log('XML content length:', xmlContent.length);

    try {
      // Parse XML content using the xml module
      const xmlDoc = parse(xmlContent);
      
      if (!xmlDoc || !xmlDoc.root) {
        throw new Error('קובץ ה-XML ריק או לא תקין');
      }

      const items = xmlDoc.root.children?.filter(node => 
        node.type === 'element' && 
        node.name === 'Item'
      ) || [];
      
      console.log(`Found ${items.length} items in XML`);

      if (!items || items.length === 0) {
        throw new Error('לא נמצאו פריטים בקובץ ה-XML');
      }

      let totalProcessed = 0;
      const batches = [];

      // Split items into batches
      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batchItems = items.slice(i, i + BATCH_SIZE);
        batches.push(batchItems);
      }

      console.log(`Split into ${batches.length} batches of ${BATCH_SIZE} items each`);

      // Process each batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batchItems = batches[batchIndex];
        console.log(`Processing batch ${batchIndex + 1}/${batches.length}`);

        const products = batchItems.map((item) => {
          const getElementText = (tagName: string): string => {
            const element = item.children?.find(child => 
              child.type === 'element' && 
              child.name === tagName
            );
            return element?.text?.trim() || '';
          };

          const priceUpdateDate = new Date().toISOString();

          return {
            store_chain: networkName,
            store_id: branchName,
            product_code: getElementText('ItemCode'),
            product_name: getElementText('ItemName'),
            manufacturer: getElementText('ManufacturerName'),
            price: parseFloat(getElementText('ItemPrice')) || 0,
            unit_quantity: getElementText('UnitQty'),
            unit_of_measure: getElementText('UnitOfMeasure'),
            category: getElementText('ItemSection') || 'כללי',
            price_update_date: priceUpdateDate
          };
        }).filter(product => 
          product.product_code && 
          product.product_name && 
          !isNaN(product.price) && 
          product.price >= 0
        );

        if (products.length > 0) {
          const successCount = await insertProducts(products);
          totalProcessed += successCount;
          console.log(`Batch ${batchIndex + 1}: Successfully processed ${successCount} products`);
        }

        // Add a small delay between batches to prevent overwhelming the database
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`Total processed: ${totalProcessed} products`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully processed ${totalProcessed} items`,
          count: totalProcessed
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } catch (parseError) {
      console.error('XML parsing error:', parseError);
      throw new Error(`שגיאה בפרסור ה-XML: ${parseError.message}`);
    }

  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'שגיאה בעיבוד ה-XML'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});