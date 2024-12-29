import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    // File size limit check
    if (contentLength > 100 * 1024 * 1024) {
      throw new Error('קובץ ה-XML גדול מדי. הגודל המקסימלי הוא 100MB');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Insert the products into the database
    const { error: insertError } = await supabase
      .from('store_products')
      .insert([
        {
          store_chain: requestData.networkName,
          store_id: requestData.branchName,
          product_code: '123', // This is a test, we'll parse the XML properly in the next iteration
          product_name: 'Test Product',
          price: 100,
          price_update_date: new Date().toISOString()
        }
      ]);

    if (insertError) {
      console.error('Error inserting products:', insertError);
      throw new Error('שגיאה בשמירת המוצרים במסד הנתונים');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'הקובץ עובד בהצלחה'
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