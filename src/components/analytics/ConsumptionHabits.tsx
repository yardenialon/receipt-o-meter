import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Receipt } from 'lucide-react';

interface ProductSummary {
  name: string;
  total_spent: number;
  quantity: number;
  product_code?: string | null;
}

export const ConsumptionHabits = () => {
  const { data: topProducts } = useQuery({
    queryKey: ['top-products'],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('receipt_items')
        .select(`
          name,
          price,
          quantity,
          product_code,
          receipts!inner (
            created_at
          )
        `)
        .gte('receipts.created_at', startOfMonth.toISOString());

      if (error) throw error;

      // Group and sum by product name
      const productSummaries = data.reduce((acc: { [key: string]: ProductSummary }, item) => {
        const key = item.name;
        if (!acc[key]) {
          acc[key] = {
            name: key,
            total_spent: 0,
            quantity: 0,
            product_code: item.product_code
          };
        }
        acc[key].total_spent += item.price;
        acc[key].quantity += item.quantity || 1;
        return acc;
      }, {});

      // Convert to array and sort by total spent
      return Object.values(productSummaries)
        .sort((a, b) => b.total_spent - a.total_spent)
        .slice(0, 10);
    }
  });

  if (!topProducts?.length) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base md:text-lg font-medium">הרגלי צריכה חודשיים</CardTitle>
        <Receipt className="h-6 w-6 md:h-8 md:w-8 text-primary" strokeWidth={1.5} />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full pr-4">
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div key={product.name} className="flex flex-col space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-900">{product.name}</span>
                  <span className="text-primary-600 font-bold">
                    ₪{product.total_spent.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {product.quantity} יחידות נרכשו החודש
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};