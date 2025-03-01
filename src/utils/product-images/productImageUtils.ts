
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Define the type for product images
export interface ProductImage {
  id: string;
  product_code: string;
  image_path: string;
  created_at: string;
  is_primary: boolean;
  status: string;
}

export async function fetchProductImages(productCode: string): Promise<ProductImage[]> {
  try {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_code', productCode)
      .order('is_primary', { ascending: false });

    if (error) {
      console.error('Error fetching product images:', error);
      return [];
    }

    // Type assertion - we know the structure matches our ProductImage interface
    return data as ProductImage[];
  } catch (error) {
    console.error('Error in fetchProductImages:', error);
    return [];
  }
}

export async function getImageUrl(imagePath: string): Promise<string> {
  if (!imagePath) return '/placeholder.svg';
  
  try {
    const { data } = await supabase.storage.from('product-images').getPublicUrl(imagePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting image URL:', error);
    return '/placeholder.svg';
  }
}

export async function setAsPrimaryImage(imageId: string, productCode: string): Promise<boolean> {
  try {
    // Set all images of this product to not primary
    const { error: updateError } = await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_code', productCode);

    if (updateError) {
      console.error('Error updating primary images:', updateError);
      return false;
    }

    // Then set the selected image as primary
    const { error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId);

    if (error) {
      console.error('Error setting primary image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in setAsPrimaryImage:', error);
    return false;
  }
}

export async function deleteProductImage(imageId: string, imagePath: string): Promise<boolean> {
  try {
    // Delete the image file from storage
    const { error: storageError } = await supabase.storage
      .from('product-images')
      .remove([imagePath]);

    if (storageError) {
      console.error('Error deleting image from storage:', storageError);
      return false;
    }

    // Delete the image record from the database
    const { error: dbError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      console.error('Error deleting image record:', dbError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProductImage:', error);
    return false;
  }
}

export async function uploadProductImage(
  file: File,
  productCode: string,
  isPrimary: boolean = false
): Promise<ProductImage | null> {
  try {
    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = `${productCode}/${fileName}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    // If this is the first image or marked as primary, set other images as non-primary
    if (isPrimary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_code', productCode);
    }

    // Create record in database
    const { data, error: insertError } = await supabase
      .from('product_images')
      .insert({
        product_code: productCode,
        image_path: filePath,
        is_primary: isPrimary,
        status: 'active'
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting image record:', insertError);
      return null;
    }

    return data as ProductImage;
  } catch (error) {
    console.error('Error in uploadProductImage:', error);
    return null;
  }
}
