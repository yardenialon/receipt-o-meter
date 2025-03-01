
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductImageGallery } from '@/components/products/images/ProductImageGallery';
import { BulkImageUpload } from '@/components/products/images/BulkImageUpload';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ImageIcon, Package, UploadCloud } from 'lucide-react';

export default function ProductImages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductCode, setSelectedProductCode] = useState<string | null>(null);

  // Query to search products
  const { data: products, isLoading } = useQuery({
    queryKey: ['products-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 3) return [];
      
      let query = supabase
        .from('store_products')
        .select('product_code, product_name, manufacturer')
        .order('product_name');
      
      if (searchQuery) {
        query = query.or(`product_name.ilike.%${searchQuery}%,product_code.ilike.%${searchQuery}%`);
      }
      
      query = query.limit(20);
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      // Remove duplicates (by product_code)
      const uniqueProducts = Array.from(
        new Map(data.map(item => [item.product_code, item])).values()
      );
      
      return uniqueProducts;
    },
    enabled: searchQuery.length >= 3
  });

  // Query to get statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['product-images-stats'],
    queryFn: async () => {
      // Get total products count
      const { count: totalProducts, error: countError } = await supabase
        .from('store_products')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error fetching product count:', countError);
        throw countError;
      }
      
      // Get products with images count
      const { data: imageStats, error: statsError } = await supabase
        .from('product_images')
        .select('product_code')
        .eq('status', 'active');
      
      if (statsError) {
        console.error('Error fetching image stats:', statsError);
        throw statsError;
      }
      
      // Count unique product codes
      const uniqueProductsWithImages = new Set(imageStats.map(item => item.product_code)).size;
      
      return {
        totalProducts: totalProducts || 0,
        productsWithImages: uniqueProductsWithImages,
        coveragePercentage: totalProducts 
          ? Math.round((uniqueProductsWithImages / totalProducts) * 100) 
          : 0
      };
    }
  });

  const handleProductSelect = (productCode: string) => {
    setSelectedProductCode(productCode);
  };

  const refreshStats = () => {
    // Invalidate the stats query to refresh data
    // You could access the queryClient here to invalidate the query
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">ניהול תמונות מוצר</h1>
          <p className="text-muted-foreground mt-1">
            העלה, ערוך ונהל תמונות עבור מוצרים
          </p>
        </div>
        <BulkImageUpload onSuccess={refreshStats} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* סטטיסטיקות */}
        {isLoadingStats ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>סה"כ מוצרים</CardDescription>
                <CardTitle className="text-2xl">{stats?.totalProducts.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <Package className="h-5 w-5 text-gray-400" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>מוצרים עם תמונות</CardDescription>
                <CardTitle className="text-2xl">{stats?.productsWithImages.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageIcon className="h-5 w-5 text-gray-400" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>אחוז כיסוי</CardDescription>
                <CardTitle className="text-2xl">{stats?.coveragePercentage}%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-blue-500 rounded-full" 
                    style={{ width: `${stats?.coveragePercentage || 0}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* חיפוש מוצרים */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>חיפוש מוצרים</CardTitle>
            <CardDescription>
              חפש מוצרים לפי שם או קוד מוצר
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="הקלד לפחות 3 תווים לחיפוש..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : searchQuery.length < 3 ? (
                <div className="p-8 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  הקלד לפחות 3 תווים לחיפוש
                </div>
              ) : products && products.length > 0 ? (
                <ul className="divide-y">
                  {products.map((product) => (
                    <li key={product.product_code}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-4 py-3 h-auto"
                        onClick={() => handleProductSelect(product.product_code)}
                      >
                        <div className="text-right w-full">
                          <p className="font-medium truncate">{product.product_name}</p>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>{product.manufacturer}</span>
                            <span>#{product.product_code}</span>
                          </div>
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Package className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  לא נמצאו מוצרים תואמים
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500">
              לחץ על מוצר כדי לנהל את התמונות שלו
            </p>
          </CardContent>
        </Card>

        {/* תצוגת תמונות */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>תמונות מוצר</CardTitle>
            <CardDescription>
              {selectedProductCode 
                ? `ניהול תמונות עבור מוצר #${selectedProductCode}` 
                : 'בחר מוצר מהרשימה כדי לנהל את התמונות שלו'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedProductCode ? (
              <div className="border border-dashed rounded-lg p-10 text-center">
                <UploadCloud className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium mb-1">בחר מוצר להתחלה</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  חפש וסנן מוצרים מהרשימה בצד שמאל, ולחץ על מוצר כדי לנהל את התמונות שלו
                </p>
              </div>
            ) : (
              <ProductImageGallery productCode={selectedProductCode} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
