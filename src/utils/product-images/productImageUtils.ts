
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ProductImage {
  id: string;
  product_code: string;
  image_path: string;
  created_at: string;
  is_primary: boolean;
  source?: string;
  status: 'active' | 'pending' | 'deleted';
}

export interface ImageBatchUpload {
  id: string;
  fileName: string;
  totalImages: number;
  processedImages: number;
  successCount: number;
  failedCount: number;
  status: 'processing' | 'completed' | 'failed';
  errorLog?: any;
  createdAt: string;
  completedAt?: string;
}

/**
 * Fetches all images for a specific product
 */
export async function fetchProductImages(productCode: string): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_code', productCode)
    .eq('status', 'active')
    .order('is_primary', { ascending: false });
  
  if (error) {
    console.error('Error fetching product images:', error);
    toast.error('שגיאה בטעינת תמונות המוצר');
    return [];
  }
  
  return data as ProductImage[];
}

/**
 * Uploads a single image for a product
 */
export async function uploadProductImage(file: File, productCode: string, isPrimary: boolean = false): Promise<ProductImage | null> {
  try {
    // 1. Upload the file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${productCode}_${Date.now()}.${fileExt}`;
    const filePath = `${productCode}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('product_images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      throw uploadError;
    }
    
    // 2. Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('product_images')
      .getPublicUrl(filePath);
    
    // 3. If this is the primary image, update any existing primary images
    if (isPrimary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_code', productCode)
        .eq('is_primary', true);
    }
    
    // 4. Save the image reference to the database
    const { data, error: dbError } = await supabase
      .from('product_images')
      .insert({
        product_code: productCode,
        image_path: filePath,
        is_primary: isPrimary,
        source: 'manual_upload'
      })
      .select()
      .single();
    
    if (dbError) {
      throw dbError;
    }
    
    toast.success('התמונה הועלתה בהצלחה');
    return data as ProductImage;
    
  } catch (error) {
    console.error('Error uploading product image:', error);
    toast.error('שגיאה בהעלאת התמונה');
    return null;
  }
}

/**
 * Sets an image as the primary image for a product
 */
export async function setAsPrimaryImage(imageId: string, productCode: string): Promise<boolean> {
  try {
    // First, reset any current primary images
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_code', productCode)
      .eq('is_primary', true);
    
    // Then set the selected image as primary
    const { error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId);
    
    if (error) throw error;
    
    toast.success('התמונה הראשית עודכנה בהצלחה');
    return true;
  } catch (error) {
    console.error('Error setting primary image:', error);
    toast.error('שגיאה בעדכון התמונה הראשית');
    return false;
  }
}

/**
 * Deletes a product image
 */
export async function deleteProductImage(imageId: string, imagePath: string): Promise<boolean> {
  try {
    // First delete from storage
    const { error: storageError } = await supabase.storage
      .from('product_images')
      .remove([imagePath]);
    
    if (storageError) {
      console.error('Error deleting image from storage:', storageError);
    }
    
    // Then delete from database
    const { error: dbError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);
    
    if (dbError) throw dbError;
    
    toast.success('התמונה נמחקה בהצלחה');
    return true;
  } catch (error) {
    console.error('Error deleting product image:', error);
    toast.error('שגיאה במחיקת התמונה');
    return false;
  }
}

/**
 * Returns the primary image for a product, or the first available image
 */
export async function getProductMainImage(productCode: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_code', productCode)
    .eq('status', 'active')
    .order('is_primary', { ascending: false })
    .limit(1);
  
  if (error || !data || data.length === 0) {
    return null;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('product_images')
    .getPublicUrl(data[0].image_path);
  
  return publicUrl;
}

export function getImageUrl(imagePath: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from('product_images')
    .getPublicUrl(imagePath);
  
  return publicUrl;
}
