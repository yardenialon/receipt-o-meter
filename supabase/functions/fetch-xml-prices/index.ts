import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { parse as xmlParse } from "https://deno.land/x/xml@2.1.1/mod.ts";
import { parseXmlItems } from "./xml-parser.ts";
import { insertProducts } from "./db-operations.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { xmlContent, networkName, branchName } = await req.json();
    
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

    // Parse XML
    console.log('Parsing XML content...');
    let parsedXml;
    try {
      parsedXml = xmlParse(cleanXmlContent);
      console.log('XML parsed successfully');
    } catch (parseError) {
      console.error('XML Parse Error:', parseError);
      throw new Error('שגיאה בפרסור ה-XML: ' + parseError.message);
    }

    if (!parsedXml) {
      throw new Error('XML parsing resulted in null');
    }

    // Parse items from XML
    const products = parseXmlItems(parsedXml).map(product => ({
      ...product,
      store_chain: networkName,
      store_id: branchName
    }));

    if (products.length === 0) {
      throw new Error('לא נמצאו מוצרים תקינים ב-XML');
    }

    // Insert products into database
    const successCount = await insertProducts(products);

    if (successCount === 0) {
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
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'שגיאה בעיבוד ה-XML',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});