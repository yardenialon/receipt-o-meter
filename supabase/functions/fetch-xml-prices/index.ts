import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { parseXmlItems } from './xml-parser.ts';

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

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(requestData.xmlContent, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error('XML parsing error:', parserError.textContent);
      throw new Error('קובץ ה-XML אינו תקין');
    }

    // Get items from XML structure
    const items = xmlDoc.querySelectorAll('Items > Item');
    console.log(`Found ${items.length} items in XML`);
    
    if (!items || items.length === 0) {
      throw new Error('לא נמצאו פריטים בקובץ ה-XML');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const products = Array.from(items).map((item) => {
      const getElementText = (tagName: string): string => {
        const element = item.querySelector(tagName);
        return element?.textContent?.trim() || '';
      };

      return {
        store_chain: requestData.networkName,
        store_id: requestData.branchName,
        product_code: getElementText('ItemCode'),
        product_name: getElementText('ItemName'),
        manufacturer: getElementText('ManufacturerName'),
        price: parseFloat(getElementText('ItemPrice')) || 0,
        unit_quantity: getElementText('UnitQty'),
        unit_of_measure: getElementText('UnitOfMeasure'),
        category: getElementText('ItemSection') || 'כללי',
        price_update_date: new Date().toISOString()
      };
    }).filter(product => 
      product.product_code && 
      product.product_name && 
      !isNaN(product.price) && 
      product.price >= 0
    );

    console.log(`Processing ${products.length} valid products`);

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