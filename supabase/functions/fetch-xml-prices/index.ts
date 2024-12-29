import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { parse } from 'https://deno.land/x/xml@2.1.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function validateXMLStructure(xmlContent: string) {
  try {
    // Log the start of XML content for debugging
    console.log('XML Content (first 500 chars):', xmlContent.substring(0, 500));

    const xmlData = parse(xmlContent);
    console.log('Parsed XML structure:', {
      hasItems: !!xmlData?.root?.PriceFullList,
      hasItem: !!xmlData?.root?.PriceFullList?.Item,
      itemType: typeof xmlData?.root?.PriceFullList?.Item,
      keys: Object.keys(xmlData?.root || {})
    });

    if (!xmlData?.root?.PriceFullList) {
      throw new Error('Invalid XML structure: missing PriceFullList element');
    }

    // Check if Items.Item is an array or single item
    const items = Array.isArray(xmlData.root.PriceFullList.Item) 
      ? xmlData.root.PriceFullList.Item 
      : [xmlData.root.PriceFullList.Item];
    
    console.log(`Found ${items.length} items in XML`);

    return items;
  } catch (error) {
    console.error('XML Validation Error:', error);
    throw error;
  }
}

serve(async (req) => {
  // Log request details
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers));

  // Handle CORS preflight requests
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
      branchName: requestData?.branchName,
      allKeys: Object.keys(requestData || {})
    });

    // Validate required parameters
    if (!requestData?.networkName || !requestData?.branchName) {
      console.error('Missing required fields:', { 
        networkName: requestData?.networkName,
        branchName: requestData?.branchName
      });
      throw new Error('חסרים פרטי רשת וסניף');
    }

    if (!requestData?.xmlContent) {
      console.error('Missing XML content');
      throw new Error('לא התקבל תוכן XML');
    }

    console.log('Processing XML content...');
    const items = await validateXMLStructure(requestData.xmlContent);

    if (!items || items.length === 0) {
      throw new Error('לא נמצאו פריטים בקובץ ה-XML');
    }

    // Process items and prepare for database insertion
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
      .filter(Boolean);

    if (products.length === 0) {
      throw new Error('לא נמצאו מוצרים תקינים בקובץ');
    }

    console.log(`Successfully processed ${products.length} valid products`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `נמצאו ${products.length} מוצרים תקינים`,
        count: products.length,
        products: products
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'שגיאה בעיבוד ה-XML',
        details: error.toString(),
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});