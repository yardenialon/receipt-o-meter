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
    console.log('Request data received:', {
      hasXmlContent: !!requestData?.xmlContent,
      contentLength: requestData?.xmlContent?.length,
      networkName: requestData?.networkName,
      branchName: requestData?.branchName
    });

    if (!requestData) {
      throw new Error('בקשה לא תקינה - חסרים נתונים');
    }
    
    const { xmlContent, networkName, branchName } = requestData;
    
    if (!xmlContent) {
      throw new Error('לא התקבל תוכן XML');
    }

    if (!networkName || !branchName) {
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
      throw new Error('תוכן ה-XML ריק לאחר ניקוי');
    }

    console.log('XML content length:', cleanXmlContent.length);
    console.log('First 200 characters of XML:', cleanXmlContent.substring(0, 200));

    // Parse XML with error handling
    console.log('Attempting to parse XML content...');
    let parsedXml;
    try {
      parsedXml = xmlParse(cleanXmlContent);
      console.log('XML parsed successfully');
      console.log('XML structure:', JSON.stringify(parsedXml).substring(0, 500) + '...');
    } catch (parseError) {
      console.error('XML Parse Error:', parseError);
      throw new Error('שגיאה בפרסור ה-XML: ' + parseError.message);
    }

    if (!parsedXml) {
      throw new Error('פרסור ה-XML נכשל');
    }

    // Parse items from XML
    console.log('Starting to parse XML items...');
    const products = parseXmlItems(parsedXml).map(product => ({
      ...product,
      store_chain: networkName,
      store_id: branchName
    }));

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('לא נמצאו מוצרים תקינים ב-XML');
    }

    console.log(`Found ${products.length} products to process`);
    console.log('Sample of first 3 products:', products.slice(0, 3));

    // Insert products into database
    console.log('Attempting to insert products into database...');
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