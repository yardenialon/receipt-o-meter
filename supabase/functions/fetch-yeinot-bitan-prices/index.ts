
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Yeinot Bitan price fetch operation...');
    const API_TOKEN = Deno.env.get("OPEN_ISRAELI_MARKETS_TOKEN");

    if (!API_TOKEN) {
      throw new Error('API token not configured');
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create a record for this operation
    const { data: updateRecord, error: updateError } = await supabase
      .from('price_updates')
      .insert({
        status: 'processing',
        started_at: new Date().toISOString(),
        chain_name: 'יינות ביתן'
      })
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to create update record: ${updateError.message}`);
    }

    // Fetch chain data from Open Israeli Supermarkets API
    console.log('Fetching chain data from API...');
    const chainsResponse = await fetch('https://www.openisraelisupermarkets.co.il/api/chains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!chainsResponse.ok) {
      throw new Error(`Failed to fetch chains: ${chainsResponse.statusText}`);
    }

    const chains = await chainsResponse.json();
    console.log(`Found ${chains.length} chains`);
    
    // Find Yeinot Bitan in the list - try various spellings and formats
    const yeinotBitan = chains.find(chain => 
      chain.name.includes('יינות ביתן') || 
      chain.name.toLowerCase().includes('yeinot bitan') || 
      chain.name.toLowerCase().includes('יינות') ||
      chain.name.toLowerCase().includes('ינות ביתן'));
    
    if (!yeinotBitan) {
      throw new Error('יינות ביתן not found in the API response');
    }
    
    console.log(`Found Yeinot Bitan with ID: ${yeinotBitan.id}`);

    // Fetch all stores for Yeinot Bitan
    console.log('Fetching Yeinot Bitan stores...');
    const storesResponse = await fetch(`https://www.openisraelisupermarkets.co.il/api/stores?chain_id=${yeinotBitan.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!storesResponse.ok) {
      throw new Error(`Failed to fetch stores: ${storesResponse.statusText}`);
    }

    const stores = await storesResponse.json();
    console.log(`Found ${stores.length} Yeinot Bitan stores`);

    // Update stats in database
    await supabase
      .from('price_updates')
      .update({
        total_stores: stores.length,
        processed_stores: 0
      })
      .eq('id', updateRecord.id);

    // Process each store
    let totalProducts = 0;
    let processedStores = 0;
    
    for (const store of stores) {
      try {
        console.log(`Processing store: ${store.name} (ID: ${store.id})`);
        
        // Fetch products for this store
        const searchResponse = await fetch(
          `https://www.openisraelisupermarkets.co.il/api/products/search?chain_id=${yeinotBitan.id}&store_id=${store.id}&limit=500`, 
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${API_TOKEN}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        if (!searchResponse.ok) {
          console.warn(`Failed to fetch products for store ${store.id}: ${searchResponse.statusText}`);
          continue;
        }

        const products = await searchResponse.json();
        console.log(`Found ${products.length} products for store ${store.name}`);
        
        if (products.length === 0) {
          console.warn(`No products found for store ${store.id}, skipping`);
          continue;
        }

        // Map products to our database structure and batch insert
        // IMPORTANT: Make sure store_chain is consistently "יינות ביתן"
        const mappedProducts = products.map(product => ({
          store_chain: 'יינות ביתן',
          store_id: store.id,
          product_code: product.code,
          product_name: product.name,
          manufacturer: product.manufacturer || '',
          price: parseFloat(product.price) || 0,
          unit_quantity: product.quantity || '',
          unit_of_measure: product.unit || '',
          category: product.category || 'כללי',
          price_update_date: new Date().toISOString()
        }));

        // Insert products in batches of 100
        const batchSize = 100;
        for (let i = 0; i < mappedProducts.length; i += batchSize) {
          const batch = mappedProducts.slice(i, i + batchSize);
          const { error: insertError } = await supabase
            .from('store_products')
            .upsert(batch, {
              onConflict: 'product_code,store_chain,store_id',
              ignoreDuplicates: false
            });

          if (insertError) {
            console.error(`Error inserting batch for store ${store.id}:`, insertError);
          } else {
            totalProducts += batch.length;
          }
        }

        processedStores++;
        
        // Update progress
        await supabase
          .from('price_updates')
          .update({
            processed_stores: processedStores,
            processed_products: totalProducts
          })
          .eq('id', updateRecord.id);

      } catch (storeError) {
        console.error(`Error processing store ${store.id}:`, storeError);
      }
    }

    // Mark the update as completed
    await supabase
      .from('price_updates')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_products: totalProducts,
        processed_products: totalProducts
      })
      .eq('id', updateRecord.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${totalProducts} products from ${processedStores} Yeinot Bitan stores`,
        updateId: updateRecord.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in Yeinot Bitan price fetch operation:', error);
    
    // Try to update the record with error status
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase
        .from('price_updates')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_log: { error: error.message }
        })
        .eq('chain_name', 'יינות ביתן')
        .order('created_at', { ascending: false })
        .limit(1);
    } catch (dbError) {
      console.error('Failed to update error status:', dbError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
