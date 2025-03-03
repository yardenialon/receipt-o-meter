
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export interface UploadProductImageParams {
  productCode: string;
  file: File;
}

export interface ProductImage {
  id: string;
  product_code: string;
  image_path: string;
  is_primary: boolean;
  created_at: string;
}

export const useProductImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadProductImage = async ({ productCode, file }: UploadProductImageParams) => {
    if (!productCode || !file) {
      toast.error('חסרים פרטי מוצר או תמונה');
      return null;
    }

    setIsUploading(true);

    try {
      // Sanitize filename and create a unique path
      const fileExt = file.name.split('.').pop();
      const fileName = `${productCode}_${Date.now()}.${fileExt}`;
      const filePath = `${productCode}/${fileName}`;

      console.log('Uploading image to Storage:', {
        bucket: 'product_images',
        productCode,
        fileName,
        filePath,
        fileSize: file.size,
        fileType: file.type
      });

      // Check if the bucket exists by trying to get its details
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('product_images');
      
      if (bucketError) {
        console.error('Bucket error:', bucketError);
        // If the bucket doesn't exist, we'll show a more helpful error
        toast.error('שגיאת מערכת: אחסון התמונות אינו מוגדר כראוי');
        return null;
      }

      console.log('Bucket exists:', bucketData);

      // Upload the file to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('product_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        console.error('Storage error:', storageError);
        toast.error('שגיאה בהעלאת התמונה: ' + storageError.message);
        return null;
      }

      // Get the public URL for the file
      const { data: urlData } = supabase.storage
        .from('product_images')
        .getPublicUrl(filePath);

      console.log('Image uploaded successfully:', urlData);

      // Now store metadata in the database
      const { data: productImage, error: dbError } = await supabase
        .from('product_images')
        .insert({
          product_code: productCode,
          image_path: filePath,
          is_primary: true, // First image becomes primary by default
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        toast.error('שגיאה בשמירת פרטי התמונה');
        // Consider removing the file from storage since the DB insert failed
        return null;
      }

      toast.success('התמונה הועלתה בהצלחה');
      return productImage;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאת התמונה');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadProductImage
  };
};
