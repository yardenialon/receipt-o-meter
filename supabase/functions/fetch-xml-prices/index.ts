import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { parse as xmlParse } from "https://deno.land/x/xml@2.1.1/mod.ts";
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
    const contentLength = requestData?.xmlContent?.length || 0;
    console.log('Request data received:', {
      hasXmlContent: !!requestData?.xmlContent,
      contentLength,
      networkName: requestData?.networkName,
      branchName: requestData?.branchName
    });

    if (!requestData?.xmlContent) {
      throw new Error('לא התקבל תוכן XML');
    }

    if (!requestData?.networkName || !requestData?.branchName) {
      throw new Error('חסרים פרטי רשת או סניף');
    }

    // File size limit check (100MB)
    if (contentLength > 100 * 1024 * 1024) {
      throw new Error('קובץ ה-XML גדול מדי. הגודל המקסימלי הוא 100MB');
    }

    // Clean up XML content
    const cleanXmlContent = requestData.xmlContent
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    console.log('Starting XML parsing...');

    // Parse XML with error handling
    let parsedXml;
    try {
      parsedXml = xmlParse(cleanXmlContent);
    } catch (parseError) {
      console.error('XML Parse Error:', parseError);
      throw new Error('שגיאה בפרסור ה-XML: ' + parseError.message);
    }

    // Handle different XML root structures
    const items = [];
    if (parsedXml.Root?.Items?.Item) {
      // Rami Levy format
      const xmlItems = parsedXml.Root.Items.Item;
      items.push(...(Array.isArray(xmlItems) ? xmlItems : [xmlItems]));
    } else if (parsedXml.root?.Items?.Item) {
      // Alternative format
      const xmlItems = parsedXml.root.Items.Item;
      items.push(...(Array.isArray(xmlItems) ? xmlItems : [xmlItems]));
    } else {
      console.error('Invalid XML structure:', parsedXml);
      throw new Error('מבנה ה-XML אינו תקין - לא נמצאו פריטים');
    }

    console.log(`Found ${items.length} items in XML`);

    // Check if number of items is within limit
    if (items.length > 12000) {
      throw new Error(`מספר הפריטים (${items.length}) חורג מהמגבלה של 12,000 פריטים`);
    }

    // Map items to our product structure with validation
    const products = items.map((item, index) => {
      try {
        if (!item.ItemCode || !item.ItemName || !item.ItemPrice) {
          console.warn(`Invalid item at index ${index}, skipping:`, item);
          return null;
        }

        const priceUpdateDate = item.PriceUpdateDate 
          ? new Date(item.PriceUpdateDate.replace(' ', 'T')).toISOString()
          : new Date().toISOString();

        return {
          store_chain: requestData.networkName,
          store_id: item.StoreId || requestData.branchName,
          product_code: String(item.ItemCode).trim(),
          product_name: String(item.ItemName).trim(),
          manufacturer: item.ManufacturerName ? String(item.ManufacturerName).trim() : null,
          price: parseFloat(item.ItemPrice) || 0,
          unit_quantity: item.UnitQty ? String(item.UnitQty).trim() : null,
          unit_of_measure: item.UnitOfMeasure ? String(item.UnitOfMeasure).trim() : null,
          category: item.Category ? String(item.Category).trim() : 'כללי',
          price_update_date: priceUpdateDate
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
    
    // Insert products into database in batches
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