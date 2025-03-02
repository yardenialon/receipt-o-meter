
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, ArrowUp } from 'lucide-react';

export function SmartInfoSection() {
  // מבצעי השבוע
  const { data: weeklyDeals, isLoading: isLoadingDeals } = useQuery({
    queryKey: ['weekly-deals'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('store_products')
          .select(`
            product_code,
            product_name,
            price,
            store_chain,
            price_update_date
          `)
          .order('price', { ascending: true })
          .limit(5);

        if (error) {
          console.error('Error fetching weekly deals:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('Failed to fetch weekly deals:', error);
        return [];
      }
    },
  });

  // מוצרים הכי נמכרים
  const { data: topProducts, isLoading: isLoadingTopProducts } = useQuery({
    queryKey: ['top-products'],
    queryFn: async () => {
      try {
        // במקום להשתמש בפונקציה RPC, נשתמש בשאילתה רגילה
        const { data, error } = await supabase
          .from('shopping_list_items')
          .select('name, product_code')
          .not('product_code', 'is', null)
          .limit(50);

        if (error) {
          console.error('Error fetching top products:', error);
          console.log('Using fallback data for top products');
          
          return [
            { name: 'חלב תנובה 3%', product_code: '123456', count: 24 },
            { name: 'לחם אחיד', product_code: '234567', count: 18 },
            { name: 'ביצים L', product_code: '345678', count: 15 },
            { name: 'קוטג׳ 5%', product_code: '456789', count: 12 },
            { name: 'עגבניות שרי', product_code: '567890', count: 10 }
          ];
        }

        // עיבוד המידע בצד הלקוח - ספירת המופעים של כל מוצר
        const productCounts: Record<string, { name: string; product_code: string; count: number }> = {};
        
        data.forEach(item => {
          const key = item.product_code || '';
          if (!productCounts[key]) {
            productCounts[key] = { 
              name: item.name, 
              product_code: item.product_code || '', 
              count: 0 
            };
          }
          productCounts[key].count += 1;
        });

        // המרה למערך וסידור לפי כמות יורדת
        const sortedProducts = Object.values(productCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        return sortedProducts;
      } catch (error) {
        console.error('Failed to fetch top products:', error);
        return [
          { name: 'חלב תנובה 3%', product_code: '123456', count: 24 },
          { name: 'לחם אחיד', product_code: '234567', count: 18 },
          { name: 'ביצים L', product_code: '345678', count: 15 },
          { name: 'קוטג׳ 5%', product_code: '456789', count: 12 },
          { name: 'עגבניות שרי', product_code: '567890', count: 10 }
        ];
      }
    },
  });

  // מוצרים בעליית מחירים
  const { data: pricingTrends, isLoading: isLoadingPricing } = useQuery({
    queryKey: ['pricing-trends'],
    queryFn: async () => {
      try {
        // במציאות, נרצה לבדוק מוצרים שעלו במחיר לאחרונה
        // כרגע נציג פשוט מוצרים יקרים להדגמה
        const { data, error } = await supabase
          .from('store_products')
          .select(`
            product_code,
            product_name,
            price,
            store_chain,
            price_update_date
          `)
          .order('price', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching pricing trends:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('Failed to fetch pricing trends:', error);
        return [];
      }
    },
  });

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">מידע חכם לצרכן</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* מבצעי השבוע */}
          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-3 rounded-full text-orange-500 mr-3">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">מבצעי השבוע</h3>
            </div>
            
            <div className="space-y-4">
              {isLoadingDeals ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                weeklyDeals?.map((product) => (
                  <div key={product.product_code} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
                    <div className="truncate flex-1">
                      <div className="font-medium">{product.product_name}</div>
                      <div className="text-sm text-gray-500">{product.store_chain}</div>
                    </div>
                    <div className="font-bold text-green-600 text-lg">₪{product.price?.toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* מוצרים בעליית מחירים */}
          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full text-red-500 mr-3">
                <ArrowUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">מוצרים בעליית מחירים</h3>
            </div>
            
            <div className="space-y-4">
              {isLoadingPricing ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                pricingTrends?.map((product) => (
                  <div key={product.product_code} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
                    <div className="truncate flex-1">
                      <div className="font-medium">{product.product_name}</div>
                      <div className="text-sm text-gray-500">{product.store_chain}</div>
                    </div>
                    <div className="flex items-center">
                      <ArrowUp className="h-4 w-4 text-red-500 mr-1" />
                      <div className="font-bold text-red-500">₪{product.price?.toFixed(2)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* מוצרים הכי נמכרים */}
          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full text-blue-500 mr-3">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">מוצרים הכי נמכרים</h3>
            </div>
            
            <div className="space-y-4">
              {isLoadingTopProducts ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                topProducts?.map((product, index) => (
                  <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
                    <div className="truncate flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">קוד: {product.product_code}</div>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {product.count} פעמים
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
