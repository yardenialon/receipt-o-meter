
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface UploadResult {
  success: boolean;
  error?: string;
}

/**
 * Upload a single image file for a product
 */
export async function uploadImageFile(
  file: File,
  productCode: string,
  isPrimary: boolean = false,
  batchId?: string
): Promise<UploadResult> {
  try {
    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = `${productCode}/${fileName}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      return {
        success: false,
        error: `Storage error: ${uploadError.message}`
      };
    }

    // If this is the first image or marked as primary, set other images as non-primary
    if (isPrimary) {
      await supabase
        .from('product_images' as any)
        .update({ is_primary: false })
        .eq('product_code', productCode);
    }

    // Create record in database
    const { error: insertError } = await supabase
      .from('product_images' as any)
      .insert({
        product_code: productCode,
        image_path: filePath,
        is_primary: isPrimary,
        status: 'active',
        batch_id: batchId
      });

    if (insertError) {
      return {
        success: false,
        error: `Database error: ${insertError.message}`
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
