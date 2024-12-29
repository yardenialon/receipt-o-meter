import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { parse } from 'https://deno.land/x/xml@2.1.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function processXMLWithRetry(xmlContent: string, networkName: string, branchName: string, retryCount = 0) {
  try {
    if (!xmlContent) {
      throw new Error('XML content is empty');
    }

    if (!networkName || !branchName) {
      throw new Error('חסרים פרטי רשת וסניף');
    }

    console.log(`Attempt ${retryCount + 1} to process XML content of size: ${xmlContent.length} bytes`);
    console.log(`Network: ${networkName}, Branch: ${branchName}`);
    
    const xmlData = parse(xmlContent);
    console.log('XML parsed successfully');

    if (!xmlData || !xmlData.Items || !xmlData.Items.Item) {
      throw new Error('Invalid XML structure: missing Items or Item elements');
    }

    const items = Array.isArray(xmlData.Items.Item) ? xmlData.Items.Item : [xmlData.Items.Item];
    console.log(`Found ${items.length} items in XML`);

    return items;
  } catch (error) {
    console.error(`Error processing XML (attempt ${retryCount + 1}):`, error);

    if (retryCount < 3) {
      console.log(`Retrying in 1000ms...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return processXMLWithRetry(xmlContent, networkName, branchName, retryCount + 1);
    }

    throw error;
  }
}

serve(async (req) => {
  console.log('Request received:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Request data received:', {
      hasContent: !!requestData?.xmlContent,
      contentLength: requestData?.xmlContent?.length || 0,
      networkName: requestData?.networkName,
      branchName: requestData?.branchName
    });

    // Validate required parameters
    if (!requestData?.networkName || !requestData?.branchName) {
      throw new Error('חסרים פרטי רשת וסניף');
    }

    if (!requestData?.xmlContent) {
      throw new Error('לא התקבל תוכן XML');
    }

    console.log('Processing XML content...');
    const items = await processXMLWithRetry(
      requestData.xmlContent, 
      requestData.networkName, 
      requestData.branchName
    );

    if (!items || items.length === 0) {
      throw new Error('לא נמצאו פריטים בקובץ ה-XML');
    }

    // Process items and insert into database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const products = items
      .filter(item => {
        if (!item || typeof item !== 'object') {
          console.warn('Invalid item:', item);
          return false;
        }
        return true;
      })
      .map((item: any) => {
        try {
          const product = {
            store_chain: requestData.networkName,
            store_id: requestData.branchName,
            product_code: item.ItemCode?._text || '',
            product_name: item.ItemName?._text || '',
            manufacturer: item.ManufacturerName?._text || '',
            price: parseFloat(item.ItemPrice?._text) || 0,
            unit_quantity: item.UnitQty?._text || '',
            unit_of_measure: item.UnitOfMeasure?._text || '',
            category: item.ItemSection?._text || 'כללי',
            price_update_date: new Date().toISOString()
          };

          if (!product.product_code || !product.product_name || isNaN(product.price) || product.price < 0) {
            console.warn('Invalid product:', product);
            return null;
          }

          return product;
        } catch (error) {
          console.error('Error mapping item:', error);
          return null;
        }
      })
      .filter((product): product is NonNullable<typeof product> => product !== null);

    if (products.length === 0) {
      throw new Error('לא נמצאו מוצרים תקינים בקובץ');
    }

    console.log(`Processing ${products.length} valid products`);

    const BATCH_SIZE = 1000;
    let successCount = 0;

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(products.length / BATCH_SIZE)}`);

      const { error: insertError } = await supabase
        .from('store_products')
        .upsert(batch, {
          onConflict: 'store_chain,product_code',
          ignoreDuplicates: false
        });

      if (insertError) {
        console.error('Error inserting batch:', insertError);
        throw new Error(`שגיאה בשמירת המוצרים: ${insertError.message}`);
      }

      successCount += batch.length;
      console.log(`Successfully processed ${successCount}/${products.length} products`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `הועלו ${successCount} מוצרים בהצלחה`,
        count: successCount
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