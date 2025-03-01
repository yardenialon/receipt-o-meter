
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  fetchProductImages, 
  setAsPrimaryImage, 
  deleteProductImage, 
  getImageUrl 
} from '@/utils/product-images/productImageUtils';
import { ProductImage } from '@/types/product-images';
import { ProductImageUpload } from './ProductImageUpload';
import { Star, StarOff, Trash2, Image as ImageIcon } from 'lucide-react';

interface ProductImageGalleryProps {
  productCode: string;
}

export function ProductImageGallery({ productCode }: ProductImageGalleryProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  const loadImages = async () => {
    setIsLoading(true);
    const productImages = await fetchProductImages(productCode);
    setImages(productImages);
    
    // Load image URLs
    const urls: Record<string, string> = {};
    for (const image of productImages) {
      urls[image.id] = await getImageUrl(image.image_path);
    }
    setImageUrls(urls);
    
    setIsLoading(false);
  };

  useEffect(() => {
    if (productCode) {
      loadImages();
    }
  }, [productCode]);

  const handleSetPrimary = async (imageId: string) => {
    const success = await setAsPrimaryImage(imageId, productCode);
    if (success) {
      loadImages();
    }
  };

  const handleDelete = async (imageId: string, imagePath: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק תמונה זו?')) {
      const success = await deleteProductImage(imageId, imagePath);
      if (success) {
        loadImages();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">תמונות מוצר</h3>
        <ProductImageUpload 
          productCode={productCode} 
          onSuccess={loadImages}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-2">
                <Skeleton className="h-32 w-full" />
                <div className="mt-2 flex justify-between">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <img 
                    src={imageUrls[image.id] || '/placeholder.svg'} 
                    alt="תמונת מוצר" 
                    className="w-full h-full object-contain"
                  />
                  {image.is_primary && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-800 p-1 rounded-full">
                      <Star className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="p-2 flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSetPrimary(image.id)}
                    disabled={image.is_primary}
                    title="הגדר כתמונה ראשית"
                  >
                    {image.is_primary ? (
                      <Star className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(image.id, image.image_path)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="מחק תמונה"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-8 text-center">
          <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium">אין תמונות למוצר זה</h3>
          <p className="text-gray-500 mb-4">
            העלה תמונות כדי לשפר את חוויית המשתמש ולהציג את המוצר בצורה טובה יותר
          </p>
          <ProductImageUpload
            productCode={productCode}
            onSuccess={loadImages}
            trigger={
              <Button>
                העלה תמונה ראשונה
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
