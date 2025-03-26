
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

/**
 * Creates a new price update record
 */
export const createUpdateRecord = async (supabase: SupabaseClient) => {
  const { data: updateRecord, error: updateError } = await supabase
    .from('price_updates')
    .insert({
      status: 'processing',
      started_at: new Date().toISOString(),
      chain_name: 'יינות ביתן'
    })
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to create update record: ${updateError.message}`);
  }

  return updateRecord;
};

/**
 * Updates the progress of a price update operation
 */
export const updateProgress = async (
  supabase: SupabaseClient,
  updateId: string,
  progressData: {
    total_stores?: number;
    processed_stores?: number;
    processed_products?: number;
  }
) => {
  const { error } = await supabase
    .from('price_updates')
    .update(progressData)
    .eq('id', updateId);

  if (error) {
    console.error('Error updating progress:', error);
  }
};

/**
 * Marks a price update as completed
 */
export const markUpdateCompleted = async (
  supabase: SupabaseClient,
  updateId: string,
  totalProducts: number
) => {
  const { error } = await supabase
    .from('price_updates')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      total_products: totalProducts,
      processed_products: totalProducts
    })
    .eq('id', updateId);

  if (error) {
    console.error('Error marking update as completed:', error);
  }
};

/**
 * Marks the most recent price update for Yeinot Bitan as failed
 */
export const markUpdateFailed = async (
  supabase: SupabaseClient,
  errorMessage: string
) => {
  const { error } = await supabase
    .from('price_updates')
    .update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      error_log: { error: errorMessage }
    })
    .eq('chain_name', 'יינות ביתן')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error marking update as failed:', error);
  }
};
