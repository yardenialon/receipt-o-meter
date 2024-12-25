import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const COLORS = ['#47d193', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf3'];

export const SpendingByCategory = () => {
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ['spending-by-category'],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('receipt_items')
        .select(`
          category,
          price,
          quantity,
          receipts!inner(created_at)
        `)
        .gte('receipts.created_at', startOfMonth.toISOString());

      if (error) throw error;

      const categoryTotals = data.reduce((acc: { [key: string]: number }, item) => {
        const category = item.category || 'אחר';
        const total = (item.price || 0) * (item.quantity || 1);
        acc[category] = (acc[category] || 0) + total;
        return acc;
      }, {});

      return Object.entries(categoryTotals)
        .map(([name, value]) => ({
          name,
          value: Number(value.toFixed(2))
        }))
        .sort((a, b) => b.value - a.value); // מיון לפי ערך יורד
    }
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>הוצאות לפי קטגוריה</CardTitle>
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
        <CardTitle>הוצאות לפי קטגוריה</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] px-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value, percent }) => 
                `${name}: ₪${value} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={true}
              isAnimationActive={false}
            >
              {categoryData?.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </Pie>
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
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => <span style={{ fontSize: '14px' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};