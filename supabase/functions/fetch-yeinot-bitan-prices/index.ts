
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from "./utils/cors.ts";
import { createUpdateRecord, updateProgress, markUpdateCompleted, markUpdateFailed } from "./utils/database.ts";
import { fetchChains, fetchStores, fetchStoreProducts, processStoreProducts } from "./utils/api.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Yeinot Bitan price fetch operation...');
    const API_TOKEN = Deno.env.get("OPEN_ISRAELI_MARKETS_TOKEN");

    if (!API_TOKEN) {
      throw new Error('API token not configured. Please set OPEN_ISRAELI_MARKETS_TOKEN in Supabase secrets.');
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create a record for this operation
    const updateRecord = await createUpdateRecord(supabase);
    
    // Fetch chain data
    console.log('Fetching chain data from API...');
    const chains = await fetchChains(API_TOKEN);
    console.log(`Found ${chains.length} chains`);
    
    // Find Yeinot Bitan in the list - try different naming variations
    const yeinotBitanVariations = [
      'יינות ביתן',
      'ינות ביתן',
      'yeinot bitan',
      'ינות',
      'יינות',
      'ביתן'
    ];
    
    const yeinotBitan = chains.find(chain => 
      yeinotBitanVariations.some(variation => 
        chain.name.toLowerCase().includes(variation.toLowerCase())
      )
    );
    
    if (!yeinotBitan) {
      console.error('Available chains:', chains.map(c => c.name).join(', '));
      throw new Error('יינות ביתן not found in the API response. Please check chain names.');
    }
    
    console.log(`Found Yeinot Bitan with ID: ${yeinotBitan.id}, Name: ${yeinotBitan.name}`);

    // Fetch all stores for Yeinot Bitan
    console.log('Fetching Yeinot Bitan stores...');
    const stores = await fetchStores(API_TOKEN, yeinotBitan.id);
    console.log(`Found ${stores.length} Yeinot Bitan stores`);

    if (stores.length === 0) {
      throw new Error('No stores found for Yeinot Bitan');
    }

    // Update stats in database
    await updateProgress(supabase, updateRecord.id, {
      total_stores: stores.length,
      processed_stores: 0
    });

    // Process each store
    let totalProducts = 0;
    let processedStores = 0;
    
    for (const store of stores) {
      try {
        console.log(`Processing store: ${store.name} (ID: ${store.id})`);
        
        // Fetch products for this store
        const products = await fetchStoreProducts(API_TOKEN, yeinotBitan.id, store.id);
        console.log(`Found ${products.length} products for store ${store.name}`);
        
        if (products.length === 0) {
          console.warn(`No products found for store ${store.id}, skipping`);
          continue;
        }

        // Process products and insert to database
        const insertedCount = await processStoreProducts(supabase, products, store);
        totalProducts += insertedCount;
        processedStores++;
        
        // Update progress
        await updateProgress(supabase, updateRecord.id, {
          processed_stores: processedStores,
          processed_products: totalProducts
        });

        console.log(`Successfully processed store ${store.name}, inserted ${insertedCount} products`);
      } catch (storeError) {
        console.error(`Error processing store ${store.id}:`, storeError);
      }
    }

    // Mark the update as completed
    await markUpdateCompleted(supabase, updateRecord.id, totalProducts);

    console.log(`Yeinot Bitan price fetch completed successfully. Processed ${totalProducts} products from ${processedStores} stores.`);

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
      
      await markUpdateFailed(supabase, error.message);
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
