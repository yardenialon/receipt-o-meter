import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { insertProducts } from "../fetch-xml-prices/db-operations.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Fetch XML content from URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`שגיאה בהורדת הקובץ: ${response.statusText}`);
    }

    const xmlContent = await response.text();
    console.log('XML content length:', xmlContent.length);

    // Parse XML content
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('קובץ ה-XML אינו תקין');
    }

    // Get items from XML structure
    const items = xmlDoc.querySelectorAll('Item');
    console.log(`Found ${items.length} items in XML`);

    if (!items || items.length === 0) {
      throw new Error('לא נמצאו פריטים בקובץ ה-XML');
    }

    // Map items to our product structure
    const products = Array.from(items).map((item: Element) => {
      const getElementText = (tagName: string): string => {
        const element = item.querySelector(tagName);
        return element?.textContent?.trim() || '';
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

    if (products.length === 0) {
      throw new Error('לא נמצאו מוצרים תקינים ב-XML');
    }

    console.log(`Processing ${products.length} valid products`);
    
    // Insert products into database
    const successCount = await insertProducts(products);
    console.log(`Successfully processed ${successCount} products`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${successCount} items`,
        count: successCount,
        totalItems: products.length
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
        error: error instanceof Error ? error.message : 'שגיאה בעיבוד ה-XML'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});