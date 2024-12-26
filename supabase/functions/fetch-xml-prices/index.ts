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
    // Log request details
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    const requestData = await req.json();
    if (!requestData) {
      console.error('Request data is null or undefined');
      throw new Error('Invalid request data');
    }

    console.log('Request data received:', {
      hasXmlContent: !!requestData.xmlContent,
      contentLength: requestData.xmlContent?.length,
      networkName: requestData.networkName,
      branchName: requestData.branchName
    });
    
    const { xmlContent, networkName, branchName } = requestData;
    
    if (!xmlContent) {
      console.error('XML content is missing');
      throw new Error('לא התקבל תוכן XML');
    }

    if (!networkName || !branchName) {
      console.error('Network or branch name is missing');
      throw new Error('חסרים פרטי רשת או סניף');
    }

    console.log('Processing XML content...');
    console.log('Network:', networkName);
    console.log('Branch:', branchName);
    
    // Clean up XML content
    const cleanXmlContent = xmlContent
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    if (!cleanXmlContent) {
      console.error('Cleaned XML content is empty');
      throw new Error('תוכן ה-XML ריק לאחר ניקוי');
    }

    console.log('XML content length:', cleanXmlContent.length);
    console.log('First 200 characters of XML:', cleanXmlContent.substring(0, 200));

    // Parse XML with error handling
    console.log('Attempting to parse XML content...');
    let parsedXml;
    try {
      parsedXml = xmlParse(cleanXmlContent);
      if (!parsedXml) {
        console.error('XML parsing resulted in null');
        throw new Error('XML parsing resulted in null');
      }
      console.log('XML parsed successfully. Root element:', parsedXml?.root?.tagName || 'No root element found');
      console.log('XML structure:', JSON.stringify(parsedXml, null, 2).substring(0, 500) + '...');
    } catch (parseError) {
      console.error('XML Parse Error:', parseError);
      throw new Error('שגיאה בפרסור ה-XML: ' + parseError.message);
    }

    // Parse items from XML with additional logging
    console.log('Starting to parse XML items...');
    const products = parseXmlItems(parsedXml).map(product => {
      if (!product) {
        console.error('Encountered null product during mapping');
        return null;
      }
      console.log('Processing product:', product.product_code);
      return {
        ...product,
        store_chain: networkName,
        store_id: branchName
      };
    }).filter(Boolean); // Remove any null products

    console.log(`Found ${products.length} products to process`);

    if (products.length === 0) {
      console.error('No valid products found in XML');
      throw new Error('לא נמצאו מוצרים תקינים ב-XML');
    }

    // Log sample of products for debugging
    console.log('Sample of first 3 products:', products.slice(0, 3));

    // Insert products into database with error handling
    console.log('Attempting to insert products into database...');
    const successCount = await insertProducts(products);
    console.log(`Successfully inserted ${successCount} products`);

    if (successCount === 0) {
      console.error('No products were successfully inserted');
      throw new Error('לא הצלחנו לעבד אף מוצר מה-XML');
    }

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
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      error: error // Log the entire error object
    });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'שגיאה בעיבוד ה-XML',
        details: error?.toString() || 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});