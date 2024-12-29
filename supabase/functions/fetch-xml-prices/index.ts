import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { parse } from 'https://deno.land/x/xml@2.1.1/mod.ts';
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
    console.log('Request received:', {
      hasContent: !!requestData?.xmlContent,
      networkName: requestData?.networkName,
      branchName: requestData?.branchName
    });

    if (!requestData?.xmlContent) {
      throw new Error('לא התקבל תוכן XML');
    }

    console.log('Parsing XML content...');
    let xmlData;
    try {
      xmlData = parse(requestData.xmlContent);
    } catch (parseError) {
      console.error('XML parsing error:', parseError);
      throw new Error('קובץ ה-XML אינו תקין: ' + parseError.message);
    }

    if (!xmlData) {
      console.error('Failed to parse XML document');
      throw new Error('קובץ ה-XML אינו תקין');
    }

    if (!xmlData.Items) {
      console.error('No Items found in XML structure:', xmlData);
      throw new Error('מבנה ה-XML אינו תקין: חסר תג Items');
    }

    const rawItems = xmlData.Items.Item;
    if (!rawItems) {
      console.error('No Item elements found in Items');
      throw new Error('לא נמצאו פריטים בקובץ ה-XML');
    }

    const items = Array.isArray(rawItems) ? rawItems : [rawItems];
    console.log(`Found ${items.length} items in XML`);

    if (items.length === 0) {
      throw new Error('לא נמצאו פריטים בקובץ ה-XML');
    }

    const products = parseXmlItems(items).map(product => ({
      ...product,
      store_chain: requestData.networkName || 'unknown',
      store_id: requestData.branchName || 'unknown'
    }));

    if (!products || products.length === 0) {
      throw new Error('לא נמצאו מוצרים תקינים בקובץ');
    }

    console.log(`Processing ${products.length} valid products`);
    const successCount = await insertProducts(products);

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
        error: error instanceof Error ? error.message : 'שגיאה בעיבוד ה-XML'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});