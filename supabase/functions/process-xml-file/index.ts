import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { parse as xmlParse } from "https://deno.land/x/xml@2.1.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, networkName, branchName } = await req.json();
    console.log('Starting XML file processing:', { filePath, networkName, branchName });

    if (!filePath || !networkName || !branchName) {
      throw new Error('חסרים פרטים נדרשים: נתיב קובץ, שם רשת או שם סניף');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Download the file from storage
    console.log('Downloading file from storage:', filePath);
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('receipts')
      .download(filePath);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw new Error(`שגיאה בהורדת הקובץ: ${downloadError.message}`);
    }

    if (!fileData) {
      throw new Error('לא נמצא תוכן בקובץ');
    }

    // Convert the file to text
    const xmlContent = await fileData.text();
    console.log('XML content length:', xmlContent.length);

    if (!xmlContent || xmlContent.length === 0) {
      throw new Error('קובץ ריק');
    }

    // Parse XML with detailed error handling
    let parsedXml;
    try {
      console.log('Attempting to parse XML content');
      parsedXml = xmlParse(xmlContent);
    } catch (parseError) {
      console.error('XML Parse Error:', parseError);
      throw new Error(`שגיאה בפרסור ה-XML: ${parseError.message}`);
    }

    if (!parsedXml) {
      throw new Error('פרסור ה-XML נכשל - לא התקבל תוכן תקין');
    }

    // Extract items with better error handling
    let items = [];
    console.log('XML structure:', Object.keys(parsedXml));

    if (parsedXml?.Root?.Items?.Item) {
      const xmlItems = parsedXml.Root.Items.Item;
      items = Array.isArray(xmlItems) ? xmlItems : [xmlItems];
    } else if (parsedXml?.root?.Items?.Item) {
      const xmlItems = parsedXml.root.Items.Item;
      items = Array.isArray(xmlItems) ? xmlItems : [xmlItems];
    } else {
      console.error('Invalid XML structure:', JSON.stringify(parsedXml, null, 2));
      throw new Error('מבנה ה-XML אינו תקין - לא נמצאו פריטים');
    }

    console.log(`Found ${items.length} items in XML`);

    if (!items || items.length === 0) {
      throw new Error('לא נמצאו פריטים ב-XML');
    }

    if (items.length > 12000) {
      throw new Error(`מספר הפריטים (${items.length}) חורג מהמגבלה של 12,000 פריטים`);
    }

    // Map and validate items
    const products = items
      .map((item: any, index: number) => {
        try {
          if (!item) {
            console.warn(`Skipping null item at index ${index}`);
            return null;
          }

          if (!item.ItemCode || !item.ItemName || !item.ItemPrice) {
            console.warn(`Invalid item at index ${index}, missing required fields:`, item);
            return null;
          }

          const priceUpdateDate = item.PriceUpdateDate 
            ? new Date(item.PriceUpdateDate.replace(' ', 'T')).toISOString()
            : new Date().toISOString();

          return {
            store_chain: networkName,
            store_id: item.StoreId || branchName,
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
      })
      .filter((product: any): product is NonNullable<typeof product> => product !== null);

    if (products.length === 0) {
      throw new Error('לא נמצאו מוצרים תקינים ב-XML');
    }

    console.log(`Processing ${products.length} valid products`);
    
    // Process in smaller batches
    const batchSize = 50; // Reduced batch size
    let successCount = 0;
    let failedCount = 0;
    const totalBatches = Math.ceil(products.length / batchSize);

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} products)`);
      
      try {
        const { error } = await supabase
          .from('store_products')
          .upsert(batch, {
            onConflict: 'product_code,store_chain',
            ignoreDuplicates: false
          });

        if (error) {
          console.error(`Error in batch ${batchNumber}:`, error);
          failedCount += batch.length;
          // Continue with next batch despite error
          continue;
        }

        successCount += batch.length;
        console.log(`Batch ${batchNumber}/${totalBatches} completed. Progress: ${Math.round((successCount / products.length) * 100)}%`);
      } catch (batchError) {
        console.error(`Error processing batch ${batchNumber}:`, batchError);
        failedCount += batch.length;
        // Continue with next batch
        continue;
      }
      
      // Add a small delay between batches
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Clean up: Delete the processed file
    console.log('Cleaning up: Deleting processed file');
    const { error: deleteError } = await supabase.storage
      .from('receipts')
      .remove([filePath]);

    if (deleteError) {
      console.error('Error deleting file:', deleteError);
      // Don't throw here, just log the error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${successCount} items`,
        count: successCount,
        totalItems: products.length,
        failedCount
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