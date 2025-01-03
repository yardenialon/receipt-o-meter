import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function insertProducts(products: any[]) {
  console.log(`Starting to insert ${products.length} products`);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const BATCH_SIZE = 500;
  let successCount = 0;

  try {
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(products.length / BATCH_SIZE)}`);

      const { error } = await supabase
        .from('store_products_import')
        .insert(batch);

      if (error) {
        console.error('Error inserting batch:', error);
        throw error;
      }

      successCount += batch.length;
      console.log(`Successfully inserted ${successCount}/${products.length} products`);
    }

    // After all products are inserted, call the processing function
    const { error: procError } = await supabase
      .rpc('process_imported_products');

    if (procError) {
      console.error('Error processing products:', procError);
      throw procError;
    }

    console.log('Successfully processed all products');
    return successCount;

  } catch (error) {
    console.error('Error in insertProducts:', error);
    throw error;
  }
}