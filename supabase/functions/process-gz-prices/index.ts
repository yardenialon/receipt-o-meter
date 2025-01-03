import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { gunzip } from "https://deno.land/x/compress@v0.4.5/gzip/mod.ts"
import { parse } from 'https://deno.land/x/xml@2.1.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing request...');
    const formData = await req.formData();
    const file = formData.get('file');
    const networkName = formData.get('networkName');
    const branchName = formData.get('branchName');
    const storeAddress = formData.get('storeAddress');

    if (!file || !networkName || !branchName || !storeAddress) {
      console.error('Missing required fields:', { 
        hasFile: !!file, 
        hasNetworkName: !!networkName, 
        hasBranchName: !!branchName,
        hasStoreAddress: !!storeAddress 
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'חסרים שדות נדרשים: קובץ, שם רשת, שם סניף או כתובת' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log('Received data:', {
      hasFile: !!file,
      networkName,
      branchName,
      storeAddress,
      fileName: file?.name,
      fileSize: file?.size
    });

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'תצורת השרת חסרה' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
      // Get file content as ArrayBuffer
      const fileContent = await file.arrayBuffer();
      
      // Decompress GZ file
      console.log('Decompressing GZ file...');
      const decompressed = gunzip(new Uint8Array(fileContent));
      const xmlContent = new TextDecoder().decode(decompressed);

      console.log('Parsing XML content...');
      const xmlData = parse(xmlContent);
      
      if (!xmlData) {
        return new Response(
          JSON.stringify({ error: 'שגיאה בפענוח קובץ ה-XML' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }

      // Extract items from XML
      let items;
      if (xmlData?.root?.Items?.Item) {
        items = xmlData.root.Items.Item;
      } else if (xmlData?.Items?.Item) {
        items = xmlData.Items.Item;
      } else {
        console.error('XML Structure:', JSON.stringify(xmlData, null, 2));
        return new Response(
          JSON.stringify({ error: 'מבנה ה-XML אינו תקין' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }

      // Convert to array if single item
      const itemsArray = Array.isArray(items) ? items : [items].filter(Boolean);
      console.log(`Found ${itemsArray.length} items in XML`);
      
      if (itemsArray.length === 0) {
        return new Response(
          JSON.stringify({ error: 'לא נמצאו פריטים בקובץ' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }

      // Process items in batches
      const batchSize = 500;
      let processedCount = 0;

      for (let i = 0; i < itemsArray.length; i += batchSize) {
        const batch = itemsArray.slice(i, i + batchSize);
        const products = batch.map(item => ({
          store_chain: networkName,
          store_id: branchName,
          store_address: storeAddress,
          ItemCode: item.ItemCode?._text,
          ItemType: item.ItemType?._text,
          ItemName: item.ItemName?._text,
          ManufacturerName: item.ManufacturerName?._text,
          ManufactureCountry: item.ManufactureCountry?._text,
          ManufacturerItemDescription: item.ManufacturerItemDescription?._text,
          UnitQty: item.UnitQty?._text,
          Quantity: parseFloat(item.Quantity?._text || '0'),
          bIsWeighted: item.bIsWeighted?._text === 'true',
          UnitOfMeasure: item.UnitOfMeasure?._text,
          QtyInPackage: parseFloat(item.QtyInPackage?._text || '0'),
          ItemPrice: parseFloat(item.ItemPrice?._text || '0'),
          UnitOfMeasurePrice: parseFloat(item.UnitOfMeasurePrice?._text || '0'),
          AllowDiscount: item.AllowDiscount?._text === 'true',
          ItemStatus: item.ItemStatus?._text,
          PriceUpdateDate: new Date().toISOString()
        }));

        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(itemsArray.length / batchSize)}`);
        
        const { error: insertError } = await supabase
          .from('store_products_import')
          .insert(products);

        if (insertError) {
          console.error('Error inserting products:', insertError);
          return new Response(
            JSON.stringify({ 
              error: 'שגיאה בשמירת המוצרים',
              details: insertError.message 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }

        processedCount += products.length;
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `עובדו ${processedCount} מוצרים בהצלחה`,
          itemsProcessed: processedCount
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (error) {
      console.error('Error processing file:', error);
      return new Response(
        JSON.stringify({ 
          error: 'שגיאה בעיבוד הקובץ',
          details: error.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: 'שגיאה בעיבוד הבקשה',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});