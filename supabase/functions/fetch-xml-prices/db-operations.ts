import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function insertProducts(products: any[]) {
  if (!products || products.length === 0) {
    console.warn('No products to insert');
    return 0;
  }

  console.log(`Starting to insert ${products.length} products`);
  const batchSize = 500;
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
      
      // Small delay between batches
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Upload completed. Success: ${successCount}, Failed: ${failedCount}`);
    return successCount;
  } catch (error) {
    console.error('Batch processing error:', error);
    throw error;
  }
}