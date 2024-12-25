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
      <Card className="w-full">
        <CardHeader>
          <CardTitle>חנויות מובילות</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          טוען...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>חנויות מובילות</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] px-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={storeData} 
            layout="vertical"
            margin={{ top: 20, right: 80, left: 140, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number"
              tickFormatter={(value) => `₪${value}`}
              tick={{ fill: '#374151', fontSize: 14 }}
              tickMargin={15}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={140}
              tick={{ fill: '#374151', fontSize: 14 }}
              tickMargin={15}
            />
            <Tooltip 
              formatter={(value) => `₪${value}`}
              contentStyle={{ 
                direction: 'rtl', 
                fontSize: '14px', 
                padding: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
              wrapperStyle={{ zIndex: 1000 }}
            />
            <Bar 
              dataKey="total" 
              fill="#47d193"
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
              label={{ 
                position: 'right',
                formatter: (value) => `₪${value}`,
                fill: '#374151',
                fontSize: 14,
                dx: 10
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};