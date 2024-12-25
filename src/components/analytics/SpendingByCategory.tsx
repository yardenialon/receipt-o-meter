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

      return Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2))
      }));
    }
  });

  if (isLoading) {
    return (
      <Card>
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
    <Card>
      <CardHeader>
        <CardTitle>הוצאות לפי קטגוריה</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
              >
                {categoryData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `₪${value}`}
                contentStyle={{ direction: 'rtl' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-2">
          {categoryData?.map((category, index) => (
            <div 
              key={category.name}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{category.name}</span>
              </div>
              <span className="font-medium">
                {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(category.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};