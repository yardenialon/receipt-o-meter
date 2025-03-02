
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame } from 'lucide-react';

export function WeeklyDealsCard() {
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

  return (
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
  );
}
