
import { useEffect, useState } from 'react';
import { Image as ImageIcon, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProductImageUpload } from './ProductImageUpload';
import { ProductImage } from '@/hooks/useProductImageUpload';
import { toast } from 'sonner';

interface ProductImagesProps {
  productCode: string;
}

export const ProductImages = ({ productCode }: ProductImagesProps) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProductImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_code', productCode)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching product images:', error);
        toast.error('שגיאה בטעינת תמונות המוצר');
        return;
      }

      setImages(data as ProductImage[] || []);
    } catch (error) {
      console.error('Failed to fetch product images:', error);
      toast.error('שגיאה בטעינת תמונות המוצר');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productCode) {
      fetchProductImages();
    }
  }, [productCode]);

  const handleDeleteImage = async (id: string, imagePath: string) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', id);

      if (dbError) {
        console.error('Error deleting image from database:', dbError);
        toast.error('שגיאה במחיקת התמונה מהמסד נתונים');
        return;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('product_images')
        .remove([imagePath]);

      if (storageError) {
        console.error('Error deleting image from storage:', storageError);
        toast.error('שגיאה במחיקת התמונה מהאחסון');
      } else {
        toast.success('התמונה נמחקה בהצלחה');
      }

      // Update local state
      setImages(prevImages => prevImages.filter(img => img.id !== id));
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('שגיאה במחיקת התמונה');
    }
  };

  if (loading) {
    return <div className="p-4 text-center">טוען תמונות...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">תמונות המוצר</h3>
        <ProductImageUpload 
          productCode={productCode} 
          onSuccess={fetchProductImages} 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.length > 0 ? (
          images.map((image) => {
            // Ensure we're handling URL generation safely
            let imageUrl = '';
            try {
              imageUrl = supabase.storage
                .from('product_images')
                .getPublicUrl(image.image_path).data.publicUrl;
            } catch (error) {
              console.error('Error generating public URL:', error);
              return null; // Skip this image if we can't get a URL
            }

            return (
              <div key={image.id} className="relative group rounded-md overflow-hidden border border-gray-200">
                <img 
                  src={imageUrl} 
                  alt={`מוצר ${productCode}`} 
                  className="w-full h-48 object-contain bg-white"
                  onError={(e) => {
                    console.error('Image failed to load:', image.image_path);
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                
                <button
                  onClick={() => handleDeleteImage(image.id, image.image_path)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white/80 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="מחק תמונה"
                >
                  <XCircle className="w-5 h-5" />
                </button>
                
                {image.is_primary && (
                  <div className="absolute bottom-0 inset-x-0 bg-primary text-primary-foreground text-xs py-1 text-center">
                    תמונה ראשית
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md border-gray-200">
            <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-gray-500">אין תמונות למוצר זה</p>
          </div>
        )}
      </div>
    </div>
  );
};
