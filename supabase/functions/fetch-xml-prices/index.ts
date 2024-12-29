import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { parse } from 'https://deno.land/x/xml@2.1.1/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function validateXMLStructure(xmlContent: string) {
  try {
    console.log('XML Content (first 500 chars):', xmlContent.substring(0, 500));
    const xmlData = parse(xmlContent);
    
    console.log('Parsed XML structure:', {
      hasRoot: !!xmlData?.root,
      rootKeys: Object.keys(xmlData?.root || {}),
      firstLevelKeys: Object.keys(xmlData || {}),
    });

    // Handle Shufersal's XML structure
    if (xmlData?.root?.Items?.Item) {
      const items = xmlData.root.Items.Item;
      const itemsArray = Array.isArray(items) ? items : [items];
      console.log(`Found ${itemsArray.length} items in Shufersal XML format`);
      return itemsArray;
    }

    // Try other possible structures (Rami Levy, etc)
    const items = xmlData?.root?.Prices?.Item || 
                 xmlData?.root?.PriceFullList?.Item ||
                 xmlData?.Prices?.Item ||
                 xmlData?.PriceFullList?.Item;

    if (!items) {
      throw new Error('Could not find Item elements in any expected location');
    }

    const itemsArray = Array.isArray(items) ? items : [items];
    console.log(`Found ${itemsArray.length} items in XML`);
    return itemsArray;
  } catch (error) {
    console.error('XML Validation Error:', error);
    throw error;
  }
}

async function insertProducts(products: any[]) {
  console.log(`Starting to insert ${products.length} products`);
  const batchSize = 100;
  let successCount = 0;

  try {
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`);

      const { error } = await supabase
        .from('store_products')
        .upsert(batch, {
          onConflict: 'product_code,store_chain',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error inserting batch:', error);
        throw error;
      }

      successCount += batch.length;
      console.log(`Successfully inserted ${successCount}/${products.length} products`);
    }

    return successCount;
  } catch (error) {
    console.error('Error in batch insertion:', error);
    throw error;
  }
}

serve(async (req) => {
  console.log('Request method:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const requestData = await req.json();
    console.log('Request data details:', {
      hasXmlContent: !!requestData?.xmlContent,
      contentLength: requestData?.xmlContent?.length || 0,
      networkName: requestData?.networkName,
      branchName: requestData?.branchName
    });

    if (!requestData?.networkName || !requestData?.branchName) {
      throw new Error('חסרים פרטי רשת וסניף');
    }

    if (!requestData?.xmlContent) {
      throw new Error('לא התקבל תוכן XML');
    }

    console.log('Processing XML content...');
    const items = await validateXMLStructure(requestData.xmlContent);

    if (!items || items.length === 0) {
      throw new Error('לא נמצאו פריטים בקובץ ה-XML');
    }

    const products = items
      .filter(item => {
        if (!item || typeof item !== 'object') {
          console.warn('Invalid item:', item);
          return false;
        }
        return true;
      })
      .map(item => {
        try {
          const priceUpdateDate = item.PriceUpdateDate ? 
            new Date(item.PriceUpdateDate.replace(' ', 'T')) : 
            new Date();

          const product = {
            store_chain: requestData.networkName,
            store_id: requestData.branchName,
            product_code: item.ItemCode || '',
            product_name: item.ItemName || '',
            manufacturer: item.ManufacturerName || '',
            price: parseFloat(item.ItemPrice) || 0,
            unit_quantity: parseFloat(item.Quantity) || item.UnitQty || '',
            unit_of_measure: item.UnitOfMeasure || '',
            category: 'כללי',
            price_update_date: priceUpdateDate.toISOString()
          };

          if (!product.product_code || !product.product_name || isNaN(product.price) || product.price <= 0) {
            console.warn('Invalid product:', product);
            return null;
          }

          return product;
        } catch (error) {
          console.error('Error mapping item:', error);
          return null;
        }
      })
      .filter(Boolean);

    if (products.length === 0) {
      throw new Error('לא נמצאו מוצרים תקינים בקובץ');
    }

    console.log('Sample processed product:', products[0]);
    
    // Insert products into database
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