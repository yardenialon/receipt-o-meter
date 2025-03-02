
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp } from 'lucide-react';

export function PricingTrendsCard() {
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
  );
}
