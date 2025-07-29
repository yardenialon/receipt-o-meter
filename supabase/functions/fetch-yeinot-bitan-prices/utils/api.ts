
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { mapProductData } from './mappers.ts';

type Chain = {
  id: string;
  name: string;
};

type Store = {
  id: string;
  name: string;
  address?: string;
};

type Product = {
  code: string;
  name: string;
  manufacturer?: string;
  price: number;
  quantity?: string;
  unit?: string;
  category?: string;
};

/**
 * Fetches all chains from the Open Israeli Supermarkets API
 */
export const fetchChains = async (apiToken: string): Promise<Chain[]> => {
  console.log('Fetching chains from API...');
  
  const chainsResponse = await fetch('https://www.openisraelisupermarkets.co.il/api/chains', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  if (!chainsResponse.ok) {
    const errorText = await chainsResponse.text();
    console.error(`Failed to fetch chains (${chainsResponse.status}): ${errorText}`);
    throw new Error(`Failed to fetch chains: ${chainsResponse.statusText}`);
  }

  const chains = await chainsResponse.json();
  console.log(`Successfully fetched ${chains.length} chains from API`);
  return chains;
};

/**
 * Fetches all stores for a specific chain
 */
export const fetchStores = async (apiToken: string, chainId: string): Promise<Store[]> => {
  console.log(`Fetching stores for chain ID: ${chainId}`);
  
  const storesResponse = await fetch(`https://www.openisraelisupermarkets.co.il/api/stores?chain_id=${chainId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  if (!storesResponse.ok) {
    const errorText = await storesResponse.text();
    console.error(`Failed to fetch stores (${storesResponse.status}): ${errorText}`);
    throw new Error(`Failed to fetch stores: ${storesResponse.statusText}`);
  }

  const stores = await storesResponse.json();
  console.log(`Successfully fetched ${stores.length} stores for chain ${chainId}`);
  return stores;
};

/**
 * Fetches products for a specific store
 */
export const fetchStoreProducts = async (apiToken: string, chainId: string, storeId: string): Promise<Product[]> => {
  console.log(`Fetching products for store ${storeId} in chain ${chainId}`);
  
  // Use a higher limit to get more products (adjustable based on API limits)
  const searchResponse = await fetch(
    `https://www.openisraelisupermarkets.co.il/api/products/search?chain_id=${chainId}&store_id=${storeId}&limit=1000`, 
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  );

  if (!searchResponse.ok) {
    const errorText = await searchResponse.text();
    console.error(`Failed to fetch products (${searchResponse.status}): ${errorText}`);
    throw new Error(`Failed to fetch products for store ${storeId}: ${searchResponse.statusText}`);
  }

  const products = await searchResponse.json();
  console.log(`Successfully fetched ${products.length} products for store ${storeId}`);
  return products;
};

/**
 * Process products and insert them into the database
 */
export const processStoreProducts = async (
  supabase: SupabaseClient,
  products: Product[],
  store: Store
): Promise<number> => {
  if (!products.length) {
    console.log(`No products to process for store ${store.id}`);
    return 0;
  }

  // Map products to our database structure
  const mappedProducts = products.map(product => mapProductData(product, store));
  let insertedCount = 0;

  // Insert products in batches of 100
  const batchSize = 100;
  for (let i = 0; i < mappedProducts.length; i += batchSize) {
    const batch = mappedProducts.slice(i, i + batchSize);
    console.log(`Inserting batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(mappedProducts.length / batchSize)} for store ${store.id} (${batch.length} products)`);
    
    const { error: insertError } = await supabase
      .from('store_products')
      .upsert(batch, {
        onConflict: 'product_code,store_chain,store_id',
        ignoreDuplicates: false
      });

    if (insertError) {
      console.error(`Error inserting batch for store ${store.id}:`, insertError);
    } else {
      insertedCount += batch.length;
      console.log(`Successfully inserted batch, total products so far: ${insertedCount}`);
    }
  }

  return insertedCount;
};
