import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { parse } from 'https://deno.land/x/xml@2.1.1/mod.ts';

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
    const xmlData = parse(requestData.xmlContent);
    
    if (!xmlData) {
      console.error('Failed to parse XML document');
      throw new Error('קובץ ה-XML אינו תקין');
    }

    // Safely navigate through the XML structure to find items
    const items = xmlData?.Items?.Item || [];
    const itemsArray = Array.isArray(items) ? items : items ? [items] : [];
    console.log(`Found ${itemsArray.length} items in XML`);
    
    if (itemsArray.length === 0) {
      throw new Error('לא נמצאו פריטים בקובץ ה-XML');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Helper function to safely get values
    const safeGetValue = (item: any, key: string): string => {
      if (!item || !key) return '';
      const value = item[key];
      return value ? String(value).trim() : '';
    };

    const products = itemsArray.map((item) => {
      if (!item) return null;

      return {
        store_chain: requestData.networkName,
        store_id: requestData.branchName,
        product_code: safeGetValue(item, 'ItemCode'),
        product_name: safeGetValue(item, 'ItemName'),
        manufacturer: safeGetValue(item, 'ManufacturerName'),
        price: parseFloat(safeGetValue(item, 'ItemPrice')) || 0,
        unit_quantity: safeGetValue(item, 'UnitQty'),
        unit_of_measure: safeGetValue(item, 'UnitOfMeasure'),
        category: safeGetValue(item, 'ItemSection') || 'כללי',
        price_update_date: new Date().toISOString()
      };
    }).filter((product): product is NonNullable<typeof product> => 
      product !== null && 
      product.product_code !== '' && 
      product.product_name !== '' && 
      !isNaN(product.price) && 
      product.price >= 0
    );

    console.log(`Processing ${products.length} valid products`);

    if (products.length === 0) {
      throw new Error('לא נמצאו מוצרים תקינים בקובץ');
    }

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