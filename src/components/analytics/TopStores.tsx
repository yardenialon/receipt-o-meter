import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const TopStores = () => {
  const { data: storeData, isLoading } = useQuery({
    queryKey: ['top-stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receipts')
        .select('store_name, total')
        .not('store_name', 'is', null)
        .order('total', { ascending: false })
        .limit(5);

      if (error) throw error;

      return data.map(store => ({
        name: store.store_name,
        total: Number(store.total?.toFixed(2) || 0)
      }));
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>חנויות מובילות</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          טוען...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>חנויות מובילות</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={storeData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number"
              tickFormatter={(value) => `₪${value}`}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100}
              tick={{ fill: '#374151' }}
            />
            <Tooltip 
              formatter={(value) => `₪${value}`}
              contentStyle={{ direction: 'rtl' }}
            />
            <Bar dataKey="total" fill="#47d193" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};