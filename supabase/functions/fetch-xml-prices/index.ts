import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { parse } from 'https://deno.land/x/xml@2.1.1/mod.ts';
import { parseXmlItems } from "./xml-parser.ts";

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

    if (!requestData?.networkName || !requestData?.branchName) {
      throw new Error('חסרים פרטי רשת או סניף');
    }

    console.log('Parsing XML content...');
    let xmlData;
    try {
      xmlData = parse(requestData.xmlContent);
    } catch (parseError) {
      console.error('XML parsing error:', parseError);
      throw new Error('קובץ ה-XML אינו תקין: ' + parseError.message);
    }

    if (!xmlData?.Items?.Item) {
      console.error('Invalid XML structure:', xmlData);
      throw new Error('מבנה ה-XML אינו תקין: לא נמצאו פריטים');
    }

    const items = Array.isArray(xmlData.Items.Item) ? xmlData.Items.Item : [xmlData.Items.Item];
    console.log(`Found ${items.length} items in XML`);

    if (items.length === 0) {
      throw new Error('לא נמצאו פריטים בקובץ ה-XML');
    }

    const products = parseXmlItems(items).map(product => ({
      ...product,
      store_chain: requestData.networkName,
      store_id: requestData.branchName
    }));

    if (products.length === 0) {
      throw new Error('לא נמצאו מוצרים תקינים בקובץ');
    }

    console.log(`Processing ${products.length} valid products`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: insertError } = await supabase
      .from('store_products')
      .upsert(products, {
        onConflict: 'product_code,store_chain',
        ignoreDuplicates: false
      });

    if (insertError) {
      console.error('Error inserting products:', insertError);
      throw new Error('שגיאה בשמירת המוצרים במסד הנתונים');
    }

    console.log('Successfully inserted products');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `הועלו ${products.length} מוצרים בהצלחה`,
        count: products.length
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