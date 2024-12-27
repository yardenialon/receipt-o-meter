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
    console.log('Processing XML file:', { filePath, networkName, branchName });

    if (!filePath || !networkName || !branchName) {
      throw new Error('חסרים פרטים נדרשים');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('receipts')
      .download(filePath);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw new Error('שגיאה בהורדת הקובץ');
    }

    // Convert the file to text
    const xmlContent = await fileData.text();
    console.log('XML content length:', xmlContent.length);

    // Parse XML
    const parsedXml = xmlParse(xmlContent);
    if (!parsedXml) {
      throw new Error('שגיאה בפרסור ה-XML');
    }

    // Handle different XML root structures
    const items = [];
    if (parsedXml?.Root?.Items?.Item) {
      const xmlItems = parsedXml.Root.Items.Item;
      items.push(...(Array.isArray(xmlItems) ? xmlItems : [xmlItems]));
    } else if (parsedXml?.root?.Items?.Item) {
      const xmlItems = parsedXml.root.Items.Item;
      items.push(...(Array.isArray(xmlItems) ? xmlItems : [xmlItems]));
    } else {
      console.error('Invalid XML structure:', parsedXml);
      throw new Error('מבנה ה-XML אינו תקין - לא נמצאו פריטים');
    }

    if (!items || items.length === 0) {
      throw new Error('לא נמצאו פריטים ב-XML');
    }

    console.log(`Found ${items.length} items in XML`);

    // Check if number of items is within limit
    if (items.length > 12000) {
      throw new Error(`מספר הפריטים (${items.length}) חורג מהמגבלה של 12,000 פריטים`);
    }

    // Map items to our product structure
    const products = items
      .map((item: any, index: number) => {
        try {
          if (!item || !item.ItemCode || !item.ItemName || !item.ItemPrice) {
            console.warn(`Invalid item at index ${index}, skipping:`, item);
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
    
    // Process products in batches
    const batchSize = 100;
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(products.length / batchSize);
      
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
          continue;
        }

        successCount += batch.length;
        console.log(`Batch ${batchNumber}/${totalBatches} completed. Progress: ${Math.round((successCount / products.length) * 100)}%`);
      } catch (batchError) {
        console.error(`Error processing batch ${batchNumber}:`, batchError);
        failedCount += batch.length;
        continue;
      }
      
      // Add a delay between batches
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Delete the file after processing
    const { error: deleteError } = await supabase.storage
      .from('receipts')
      .remove([filePath]);

    if (deleteError) {
      console.error('Error deleting file:', deleteError);
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