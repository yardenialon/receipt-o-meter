import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { parse as xmlParse } from "https://deno.land/x/xml@2.1.1/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    console.log('Received XML content length:', xmlContent.length);
    console.log('Network:', networkName);
    console.log('Branch:', branchName);
    
    // Clean up the XML content
    let cleanXmlContent = xmlContent
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
      console.log('XML structure:', JSON.stringify(parsedXml, null, 2));
    } catch (parseError) {
      console.error('XML Parse Error:', parseError);
      throw new Error('שגיאה בפרסור ה-XML: ' + parseError.message);
    }

    if (!parsedXml) {
      throw new Error('XML parsing resulted in null');
    }

    // Try different possible paths to find items
    let items = [];
    
    // Check common XML structures and ensure we always have an array
    if (parsedXml.root?.Items?.Item) {
      items = Array.isArray(parsedXml.root.Items.Item) 
        ? parsedXml.root.Items.Item 
        : [parsedXml.root.Items.Item].filter(Boolean);
    } else if (parsedXml.Items?.Item) {
      items = Array.isArray(parsedXml.Items.Item) 
        ? parsedXml.Items.Item 
        : [parsedXml.Items.Item].filter(Boolean);
    } else if (parsedXml.PriceFull?.Items?.Item) {
      items = Array.isArray(parsedXml.PriceFull.Items.Item) 
        ? parsedXml.PriceFull.Items.Item 
        : [parsedXml.PriceFull.Items.Item].filter(Boolean);
    }

    console.log('Items found:', items.length);
    
    if (!items || items.length === 0) {
      throw new Error('לא נמצאו פריטים ב-XML');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Process items in batches
    const batchSize = 100;
    let processed = 0;
    let successCount = 0;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
        .filter(item => item !== null && typeof item === 'object')
        .map(item => {
          try {
            const product = {
              store_chain: networkName,
              store_id: branchName,
              product_code: String(item.ItemCode || item.PriceCode || item.Code || '').trim(),
              product_name: String(item.ItemName || item.PriceName || item.Name || '').trim(),
              manufacturer: String(item.ManufacturerName || item.Manufacturer || '').trim(),
              price: parseFloat(String(item.ItemPrice || item.Price || '0').replace(/[^\d.-]/g, '')) || 0,
              unit_quantity: String(item.Quantity || item.UnitQty || '').trim(),
              unit_of_measure: String(item.UnitOfMeasure || item.Unit || '').trim(),
              price_update_date: new Date().toISOString(),
              category: String(item.ItemSection || item.Category || '').trim() || null
            };

            // Validate required fields
            if (!product.product_code || !product.product_name) {
              console.warn('Skipping invalid product:', product);
              return null;
            }

            if (i === 0) {
              console.log('Sample product data:', product);
            }

            return product;
          } catch (error) {
            console.error('Error processing item:', error);
            return null;
          }
        })
        .filter(Boolean); // Remove null entries

      if (batch.length === 0) {
        continue;
      }

      console.log(`Processing batch ${i/batchSize + 1}, items ${i} to ${i + batch.length}`);

      try {
        const { error } = await supabase
          .from('store_products')
          .upsert(batch, {
            onConflict: 'product_code,store_chain',
            ignoreDuplicates: false
          });

        if (error) {
          console.error('Error inserting batch:', error);
          throw error;
        } else {
          successCount += batch.length;
        }

        processed += batch.length;
        console.log(`Processed ${processed}/${items.length} items`);
      } catch (error) {
        console.error(`Error processing batch ${i/batchSize + 1}:`, error);
        // Continue with next batch instead of failing completely
      }
    }

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
        error: error.message || 'שגיאה בעיבוד ה-XML'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});