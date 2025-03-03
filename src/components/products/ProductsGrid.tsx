
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ProductsGridProps {
  products: Array<{
    productCode: string;
    products: any[];
  }>;
}

export const ProductsGrid = ({ products }: ProductsGridProps) => {
  const navigate = useNavigate();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [productImages, setProductImages] = useState<Record<string, string | null>>({});

  // Fetch product images on component mount
  useEffect(() => {
    const fetchImages = async () => {
      const imagePromises = products.map(async ({ productCode }) => {
        try {
          const { data, error } = await supabase
            .from('product_images')
            .select('image_path')
            .eq('product_code', productCode)
            .eq('is_primary', true)
            .maybeSingle();

          if (error) {
            console.error('Error fetching product image:', error);
            return [productCode, null];
          }

          if (!data) return [productCode, null];

          const { data: urlData } = supabase.storage
            .from('product_images')
            .getPublicUrl(data.image_path);

          return [productCode, urlData.publicUrl];
        } catch (error) {
          console.error('Error getting product image:', error);
          return [productCode, null];
        }
      });

      const results = await Promise.all(imagePromises);
      const imagesMap = results.reduce((acc, [code, url]) => {
        acc[code as string] = url;
        return acc;
      }, {} as Record<string, string | null>);

      setProductImages(imagesMap);
    };

    fetchImages();
  }, [products]);

  const handleImageError = (productCode: string) => {
    setImageErrors(prev => ({ ...prev, [productCode]: true }));
  };

  const handleCardClick = (productCode: string) => {
    navigate(`/products/${productCode}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(({ productCode, products }) => {
        const baseProduct = products[0];
        const prices = products.map(p => p.price).filter(price => price > 0);
        const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
        const latestUpdate = new Date(Math.max(...products.map(p => new Date(p.price_update_date).getTime())));
        
        // Calculate number of stores with this product
        const storeCount = new Set(products.map(p => p.store_chain)).size;

        return (
          <Card 
            key={productCode}
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleCardClick(productCode)}
          >
            <div className="relative h-40 bg-gray-100">
              {!imageErrors[productCode] ? (
                <img
                  src={productImages[productCode] || '/placeholder.svg'}
                  alt={baseProduct.product_name}
                  className="w-full h-full object-contain p-2"
                  onError={() => handleImageError(productCode)}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p className="text-sm">אין תמונה</p>
                </div>
              )}
            </div>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">מק״ט: {productCode}</p>
              <h3 className="font-medium text-sm line-clamp-2 h-10">{baseProduct.product_name}</h3>
              {baseProduct.manufacturer && (
                <p className="text-xs text-gray-500 mt-1">{baseProduct.manufacturer}</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-0">
              <div>
                {lowestPrice ? (
                  <p className="font-bold text-red-600">₪{lowestPrice.toFixed(2)}</p>
                ) : (
                  <p className="text-gray-500 text-sm">מחיר לא זמין</p>
                )}
                <p className="text-xs text-gray-400">מתוך {storeCount} חנויות</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {format(latestUpdate, 'dd/MM/yy', { locale: he })}
              </Badge>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
