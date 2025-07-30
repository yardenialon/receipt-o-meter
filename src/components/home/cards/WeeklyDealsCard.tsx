
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame } from 'lucide-react';

export function WeeklyDealsCard() {
  const { data: weeklyDeals, isLoading: isLoadingDeals } = useQuery({
    queryKey: ['weekly-deals'],
    queryFn: async () => {
      // כרגע נשתמש בדאטה סטטית עד שתהיה לנו טבלת store_products
      return [
        {
          product_code: 'D001',
          product_name: 'תפוחים אדומים 1 ק"ג',
          price: 8.90,
          store_chain: 'רמי לוי',
          price_update_date: new Date().toISOString()
        },
        {
          product_code: 'D002',
          product_name: 'בננות 1 ק"ג',
          price: 6.50,
          store_chain: 'שופרסל',
          price_update_date: new Date().toISOString()
        },
        {
          product_code: 'D003',
          product_name: 'יוגורט דנונה',
          price: 4.20,
          store_chain: 'יינות ביתן',
          price_update_date: new Date().toISOString()
        }
      ];
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
