import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export const createSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

export const processBatch = async (supabase: any, batch: any[]) => {
  const { error } = await supabase
    .from('store_products')
    .upsert(batch, {
      onConflict: 'product_code,store_chain',
      ignoreDuplicates: false
    });

  if (error) {
    console.error('Error inserting batch:', error);
    throw error;
  }

  return batch.length;
};

export const processItems = async (supabase: any, items: any[]) => {
  const batchSize = 100;
  let processed = 0;
  let successCount = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    try {
      const batchCount = await processBatch(supabase, batch);
      successCount += batchCount;
    } catch (error) {
      console.error(`Error processing batch ${i / batchSize + 1}:`, error);
    }
    processed += batch.length;
    console.log(`Processed ${processed}/${items.length} items`);
  }

  return successCount;
};