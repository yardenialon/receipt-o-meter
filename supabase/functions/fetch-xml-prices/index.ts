import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { parse as xmlParse } from "https://deno.land/x/xml@2.1.1/mod.ts";
import { parseXmlItems } from "./xml-parser.ts";
import { insertProducts } from "./db-operations.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Starting XML processing request');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Request data received:', {
      hasXmlContent: !!requestData?.xmlContent,
      contentLength: requestData?.xmlContent?.length,
      networkName: requestData?.networkName,
      branchName: requestData?.branchName
    });

    if (!requestData?.xmlContent) {
      throw new Error('לא התקבל תוכן XML');
    }

    if (!requestData?.networkName || !requestData?.branchName) {
      throw new Error('חסרים פרטי רשת או סניף');
    }

    // Clean up XML content
    const cleanXmlContent = requestData.xmlContent
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    console.log('XML content length after cleanup:', cleanXmlContent.length);

    // Parse XML with error handling
    let parsedXml;
    try {
      parsedXml = xmlParse(cleanXmlContent);
      console.log('XML parsed successfully. Root element:', parsedXml?.Root?.Items?.['@Count']);
    } catch (parseError) {
      console.error('XML Parse Error:', parseError);
      throw new Error('שגיאה בפרסור ה-XML: ' + parseError.message);
    }

    if (!parsedXml?.Root?.Items?.Item) {
      console.error('Invalid XML structure:', parsedXml);
      throw new Error('מבנה ה-XML אינו תקין - לא נמצאו פריטים');
    }

    // Ensure Item is always an array
    const items = Array.isArray(parsedXml.Root.Items.Item) 
      ? parsedXml.Root.Items.Item 
      : [parsedXml.Root.Items.Item];

    console.log(`Found ${items.length} items in XML`);

    // Map items to our product structure
    const products = items.map((item, index) => {
      try {
        if (!item.ItemCode || !item.ItemName || !item.ItemPrice) {
          console.warn(`Skipping invalid item at index ${index}:`, item);
          return null;
        }

        return {
          store_chain: requestData.networkName,
          store_id: item.StoreId || requestData.branchName,
          product_code: item.ItemCode,
          product_name: item.ItemName,
          manufacturer: item.ManufacturerName || null,
          price: parseFloat(item.ItemPrice) || 0,
          unit_quantity: item.UnitQty || null,
          unit_of_measure: item.UnitOfMeasure || null,
          category: item.Category || 'כללי',
          price_update_date: item.PriceUpdateDate ? new Date(item.PriceUpdateDate).toISOString() : new Date().toISOString()
        };
      } catch (error) {
        console.error(`Error processing item ${index}:`, error);
        return null;
      }
    }).filter(Boolean);

    if (products.length === 0) {
      throw new Error('לא נמצאו מוצרים תקינים ב-XML');
    }

    console.log(`Processing ${products.length} valid products`);
    
    // Insert products into database
    const successCount = await insertProducts(products);
    console.log(`Successfully inserted ${successCount} products`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${successCount} items`,
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
        details: error?.toString() || 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});