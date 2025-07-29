
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

/**
 * Creates a new price update record
 */
export const createUpdateRecord = async (supabase: SupabaseClient) => {
  console.log('Creating new price update record for Yeinot Bitan');
  
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
    console.error('Failed to create update record:', updateError);
    throw new Error(`Failed to create update record: ${updateError.message}`);
  }

  console.log(`Created price update record with ID: ${updateRecord.id}`);
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
  console.log(`Updating progress for update ${updateId}:`, progressData);
  
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
  console.log(`Marking update ${updateId} as completed with ${totalProducts} products`);
  
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
 * Marks a price update as failed
 */
export const markUpdateFailed = async (
  supabase: SupabaseClient,
  errorMessage: string
) => {
  console.log(`Marking most recent Yeinot Bitan update as failed: ${errorMessage}`);
  
  // First, find the most recent Yeinot Bitan price update
  const { data: updates, error: findError } = await supabase
    .from('price_updates')
    .select('id')
    .eq('chain_name', 'יינות ביתן')
    .eq('status', 'processing')
    .order('started_at', { ascending: false })
    .limit(1);
    
  if (findError) {
    console.error('Error finding most recent update:', findError);
    return;
  }
  
  if (!updates || updates.length === 0) {
    console.warn('No processing updates found to mark as failed');
    return;
  }
  
  const updateId = updates[0].id;
  
  // Now mark it as failed
  const { error } = await supabase
    .from('price_updates')
    .update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      error_log: { error: errorMessage }
    })
    .eq('id', updateId);

  if (error) {
    console.error('Error marking update as failed:', error);
  }
};
