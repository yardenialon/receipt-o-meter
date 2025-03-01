
import { supabase } from '@/lib/supabase';

/**
 * Create a new batch upload record
 */
export async function createBatchUploadRecord(
  batchId: string,
  batchName: string,
  totalImages: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('image_batch_uploads' as any)
      .insert({
        id: batchId,
        name: batchName,
        total_images: totalImages,
        status: 'processing'
      });
    
    if (error) {
      console.error('Error creating batch record:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in createBatchUploadRecord:', error);
    return false;
  }
}

/**
 * Update a batch upload record with final results
 */
export async function updateBatchUploadRecord(
  batchId: string,
  processed: number,
  success: number,
  failed: number,
  status: 'completed' | 'failed'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('image_batch_uploads' as any)
      .update({
        processed_images: processed,
        successful_images: success,
        failed_images: failed,
        completed_at: new Date().toISOString(),
        status: status
      })
      .eq('id', batchId);
    
    if (error) {
      console.error('Error updating batch record:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateBatchUploadRecord:', error);
    return false;
  }
}
