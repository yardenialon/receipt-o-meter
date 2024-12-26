import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { XmlProduct } from './types.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export const insertProducts = async (products: XmlProduct[]): Promise<number> => {
  console.log(`Attempting to insert ${products.length} products`);
  
  const batchSize = 100;
  let successCount = 0;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    console.log(`Processing batch ${i/batchSize + 1} of ${Math.ceil(products.length/batchSize)}`);
    
    try {
      const { data, error } = await supabase
        .from('store_products')
        .upsert(batch, {
          onConflict: 'product_code,store_chain',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`Error inserting batch ${i/batchSize + 1}:`, error);
        console.error('First product in failed batch:', batch[0]);
        continue;
      }

      successCount += batch.length;
      console.log(`Successfully processed batch ${i/batchSize + 1}. Total success: ${successCount}/${products.length}`);
    } catch (error) {
      console.error(`Error processing batch ${i/batchSize + 1}:`, error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  }

  return successCount;
};