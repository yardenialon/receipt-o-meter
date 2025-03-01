
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { checkIfTableExists } from './tableUtils';

/**
 * Upload an image file for a specific product
 */
export async function uploadImageFile(
  imageFile: File,
  productCode: string,
  isPrimary: boolean = false,
  batchId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if product_images table exists
    const tableExists = await checkIfTableExists('product_images');
    if (!tableExists) {
      return { 
        success: false, 
        error: 'product_images table does not exist' 
      };
    }

    // Generate unique filename
    const fileName = `${uuidv4()}-${imageFile.name}`;
    const filePath = `${productCode}/${fileName}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, imageFile);

    if (uploadError) {
      return { 
        success: false, 
        error: `Storage upload error: ${uploadError.message}` 
      };
    }

    // If primary, update other images
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
        error: `Database insert error: ${insertError.message}` 
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}
