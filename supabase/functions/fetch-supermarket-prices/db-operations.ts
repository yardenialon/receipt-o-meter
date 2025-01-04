import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export const createSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
};

export const createPriceUpdate = async (supabase: any) => {
  const { data: updateRecord, error: updateError } = await supabase
    .from('price_updates')
    .insert({
      status: 'processing',
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (updateError) {
    console.error('Error creating price update record:', updateError);
    throw updateError;
  }

  console.log('Created price update record:', updateRecord);
  return updateRecord;
};

export const updateProgress = async (supabase: any, updateId: string, processedCount: number, totalCount: number, errors: any[] = []) => {
  const { error: progressError } = await supabase
    .from('price_updates')
    .update({
      processed_products: processedCount,
      total_products: totalCount,
      error_log: errors.length ? { errors } : null,
    })
    .eq('id', updateId);

  if (progressError) {
    console.error('Error updating progress:', progressError);
  }
};

export const updateFinalStatus = async (supabase: any, updateId: string, status: 'completed' | 'completed_with_errors' | 'failed', error?: any) => {
  const { error: finalUpdateError } = await supabase
    .from('price_updates')
    .update({
      status,
      completed_at: new Date().toISOString(),
      error_log: error ? { error } : null,
    })
    .eq('id', updateId);

  if (finalUpdateError) {
    console.error('Error updating final status:', finalUpdateError);
  }
};