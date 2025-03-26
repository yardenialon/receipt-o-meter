
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
  const chainsResponse = await fetch('https://www.openisraelisupermarkets.co.il/api/chains', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  if (!chainsResponse.ok) {
    throw new Error(`Failed to fetch chains: ${chainsResponse.statusText}`);
  }

  return chainsResponse.json();
};

/**
 * Fetches all stores for a specific chain
 */
export const fetchStores = async (apiToken: string, chainId: string): Promise<Store[]> => {
  const storesResponse = await fetch(`https://www.openisraelisupermarkets.co.il/api/stores?chain_id=${chainId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  if (!storesResponse.ok) {
    throw new Error(`Failed to fetch stores: ${storesResponse.statusText}`);
  }

  return storesResponse.json();
};

/**
 * Fetches products for a specific store
 */
export const fetchStoreProducts = async (apiToken: string, chainId: string, storeId: string): Promise<Product[]> => {
  const searchResponse = await fetch(
    `https://www.openisraelisupermarkets.co.il/api/products/search?chain_id=${chainId}&store_id=${storeId}&limit=500`, 
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
    throw new Error(`Failed to fetch products for store ${storeId}: ${searchResponse.statusText}`);
  }

  return searchResponse.json();
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
    return 0;
  }

  // Map products to our database structure
  const mappedProducts = products.map(product => mapProductData(product, store));
  let insertedCount = 0;

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
      insertedCount += batch.length;
    }
  }

  return insertedCount;
};
