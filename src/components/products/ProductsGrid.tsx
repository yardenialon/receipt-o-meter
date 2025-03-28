
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface ProductsGridProps {
  products: Array<{
    productCode: string;
    products: Array<{
      product_code: string;
      product_name: string;
      price: number;
      manufacturer?: string;
      store_chain?: string;
    }>;
  }>;
  onAddToList?: (product: any) => void;
}

export const ProductsGrid = ({ products, onAddToList }: ProductsGridProps) => {
  const [productImages, setProductImages] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch images for all products
    const fetchProductImages = async () => {
      if (!products || products.length === 0) return;
      
      const productCodes = products.map(item => item.productCode);
      
      try {
        const { data, error } = await supabase
          .from('product_images')
          .select('product_code, image_path')
          .in('product_code', productCodes)
          .eq('is_primary', true);
        
        if (error) {
          console.error('Error fetching product images:', error);
          return;
        }
        
        // Create a map of product codes to image URLs
        const imagesMap: Record<string, string> = {};
        
        for (const item of data || []) {
          const imageUrl = supabase.storage
            .from('product_images')
            .getPublicUrl(item.image_path).data.publicUrl;
          
          imagesMap[item.product_code] = imageUrl;
        }
        
        setProductImages(imagesMap);
      } catch (error) {
        console.error('Failed to fetch product images:', error);
      }
    };
    
    fetchProductImages();
  }, [products]);

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">לא נמצאו מוצרים</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((item) => {
        const product = item.products[0]; // Use the first product for display
        const imageUrl = productImages[item.productCode];
        
        return (
          <Card key={item.productCode} className="overflow-hidden flex flex-col">
            <div className="aspect-square relative bg-gray-100">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={product.product_name}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="h-12 w-12 text-gray-300" />
                </div>
              )}
            </div>
            
            <div className="p-4 flex-1">
              <h3 className="font-medium text-sm line-clamp-2 h-10">{product.product_name}</h3>
              
              <div className="mt-2 text-xs text-gray-500">
                {product.manufacturer && <p>{product.manufacturer}</p>}
                <p>קוד: {product.product_code}</p>
              </div>
              
              {product.price > 0 && (
                <div className="mt-2 font-bold text-primary-600">
                  ₪{product.price.toFixed(2)}
                </div>
              )}
              
              {product.store_chain && (
                <div className="mt-1 text-xs">
                  {product.store_chain}
                </div>
              )}
            </div>
            
            <div className="p-3 bg-gray-50 border-t">
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => onAddToList && onAddToList({
                  code: product.product_code,
                  name: product.product_name,
                  price: product.price
                })}
              >
                <Plus className="h-4 w-4 ml-1" />
                הוסף לרשימת קניות
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
