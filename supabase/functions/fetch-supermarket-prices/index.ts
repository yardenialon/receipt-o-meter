import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseClient, createPriceUpdate, updateProgress, updateFinalStatus } from './db-operations.ts';
import { fetchPricesFromDocker } from './docker-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting price fetch operation...');
    const supabase = createSupabaseClient();
    const updateRecord = await createPriceUpdate(supabase);

    try {
      const prices = await fetchPricesFromDocker();
      
      // Process prices in batches
      const batchSize = 1000;
      let processedCount = 0;
      let errorCount = 0;
      const errors: any[] = [];

      for (let i = 0; i < prices.length; i += batchSize) {
        const batch = prices.slice(i, Math.min(i + batchSize, prices.length));
        
        const { error: insertError } = await supabase
          .from('store_products_import')
          .upsert(batch);

        if (insertError) {
          console.error(`Error inserting batch ${i / batchSize}:`, insertError);
          errorCount++;
          errors.push(insertError);
        }

        processedCount += batch.length;
        await updateProgress(supabase, updateRecord.id, processedCount, prices.length, errors);
      }

      await updateFinalStatus(
        supabase, 
        updateRecord.id, 
        errorCount > 0 ? 'completed_with_errors' : 'completed'
      );

      return new Response(
        JSON.stringify({
          success: true,
          processed: processedCount,
          errors: errorCount,
          updateId: updateRecord.id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );

    } catch (fetchError) {
      console.error('Fetch operation failed:', fetchError);
      await updateFinalStatus(supabase, updateRecord.id, 'failed', fetchError);
      throw fetchError;
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});