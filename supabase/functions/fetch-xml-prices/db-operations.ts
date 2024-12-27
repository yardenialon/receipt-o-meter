import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { XmlProduct } from './types.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export const insertProducts = async (products: XmlProduct[]): Promise<number> => {
  if (!products || products.length === 0) {
    console.error('No products provided for insertion');
    return 0;
  }

  console.log(`Starting batch insertion of ${products.length} products`);
  
  // Increased batch size for better performance
  const batchSize = 1000;
  let successCount = 0;
  let failedCount = 0;

  try {
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(products.length / batchSize);
      
      console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} products)`);
      
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
      
      // Reduced delay between batches
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  } catch (error) {
    console.error('Batch processing error:', error);
    throw error;
  }

  console.log(`Upload completed. Success: ${successCount}, Failed: ${failedCount}`);
  return successCount;
};