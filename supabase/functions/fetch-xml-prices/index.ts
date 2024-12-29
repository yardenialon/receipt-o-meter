import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { parse } from 'https://deno.land/x/xml@2.1.1/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function validateXMLStructure(xmlContent: string) {
  if (!xmlContent) {
    throw new Error('XML content is empty');
  }

  try {
    console.log('Starting XML validation...');
    const xmlData = parse(xmlContent);
    
    if (!xmlData) {
      throw new Error('Failed to parse XML data');
    }

    // Handle Shufersal's XML structure with null checks
    let items;
    if (xmlData?.root?.Items?.Item) {
      items = xmlData.root.Items.Item;
    } else if (xmlData?.Items?.Item) {
      items = xmlData.Items.Item;
    } else {
      console.error('XML Structure:', JSON.stringify(xmlData, null, 2));
      throw new Error('Could not find Item elements in expected locations');
    }

    // Convert to array if single item
    const itemsArray = Array.isArray(items) ? items : [items].filter(Boolean);
    console.log(`Found ${itemsArray.length} items in XML`);
    return itemsArray;
  } catch (error) {
    console.error('XML Validation Error:', error);
    throw error;
  }
}

async function insertProducts(products: any[]) {
  if (!products || products.length === 0) {
    console.warn('No products to insert');
    return 0;
  }

  console.log(`Starting to insert ${products.length} products`);
  const batchSize = 500;
  let successCount = 0;
  let failedCount = 0;

  try {
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(products.length / batchSize);
      
      console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} products)`);
      
      const { error } = await supabase
        .from('store_products')
        .upsert(batch, {
          onConflict: 'product_code,store_chain',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`Error in batch ${batchNumber}:`, error);
        failedCount += batch.length;
        continue;
      }

      successCount += batch.length;
      console.log(`Batch ${batchNumber}/${totalBatches} completed. Progress: ${Math.round((successCount / products.length) * 100)}%`);
      
      // Small delay between batches
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Upload completed. Success: ${successCount}, Failed: ${failedCount}`);
    return successCount;
  } catch (error) {
    console.error('Batch processing error:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const requestData = await req.json();
    console.log('Processing request with network:', requestData?.networkName, 'branch:', requestData?.branchName);

    if (!requestData?.networkName || !requestData?.branchName) {
      throw new Error('חסרים פרטי רשת וסניף');
    }

    if (!requestData?.xmlContent) {
      throw new Error('לא התקבל תוכן XML');
    }

    const items = await validateXMLStructure(requestData.xmlContent);
    console.log('Total items found in XML:', items?.length || 0);

    if (!items || items.length === 0) {
      throw new Error('לא נמצאו פריטים בקובץ ה-XML');
    }

    const products = items
      .filter(item => {
        if (!item || typeof item !== 'object') {
          console.warn('Invalid item structure:', item);
          return false;
        }
        return true;
      })
      .map(item => {
        try {
          if (!item) return null;

          // Handle different date formats
          let priceUpdateDate;
          try {
            const dateStr = item.PriceUpdateDate || new Date().toISOString();
            priceUpdateDate = new Date(dateStr.replace(' ', 'T'));
          } catch {
            priceUpdateDate = new Date();
          }

          const product = {
            store_chain: requestData.networkName,
            store_id: requestData.branchName,
            product_code: String(item.ItemCode || '').trim(),
            product_name: String(item.ItemName || '').trim(),
            manufacturer: String(item.ManufacturerName || '').trim(),
            price: parseFloat(String(item.ItemPrice || '0')),
            unit_quantity: String(item.UnitQty || item.Quantity || '').trim(),
            unit_of_measure: String(item.UnitOfMeasure || '').trim(),
            category: String(item.ItemSection || 'כללי').trim(),
            price_update_date: priceUpdateDate.toISOString()
          };

          // Validate required fields
          if (!product.product_code || !product.product_name || isNaN(product.price) || product.price <= 0) {
            console.warn('Invalid product data:', {
              code: product.product_code,
              name: product.product_name,
              price: product.price
            });
            return null;
          }

          return product;
        } catch (error) {
          console.error('Error mapping item:', error);
          return null;
        }
      })
      .filter(Boolean);

    console.log('Valid products count:', products.length);
    
    if (products.length === 0) {
      throw new Error('לא נמצאו מוצרים תקינים בקובץ');
    }

    console.log('Sample processed product:', products[0]);
    
    const insertedCount = await insertProducts(products);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `נשמרו ${insertedCount} מוצרים בהצלחה`,
        count: insertedCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'שגיאה בעיבוד ה-XML',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});