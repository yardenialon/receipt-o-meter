import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const MonthlyTrends = () => {
  const { data: monthlyData, isLoading } = useQuery({
    queryKey: ['monthly-trends'],
    queryFn: async () => {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data, error } = await supabase
        .from('receipts')
        .select('total, created_at')
        .gte('created_at', threeMonthsAgo.toISOString())
        .order('created_at');

      if (error) throw error;

      const monthlyTotals = data.reduce((acc: { [key: string]: number }, receipt) => {
        const month = new Date(receipt.created_at).toLocaleString('he-IL', { month: 'short' });
        acc[month] = (acc[month] || 0) + (receipt.total || 0);
        return acc;
      }, {});

      const monthlyData = Object.entries(monthlyTotals).map(([month, total]) => ({
        month,
        total: Number(total.toFixed(2))
      }));

      return monthlyData;
    }
  });

  const currentMonth = monthlyData?.[monthlyData.length - 1]?.total || 0;
  const previousMonth = monthlyData?.[monthlyData.length - 2]?.total || 0;
  const trend = currentMonth > previousMonth ? 
    { icon: TrendingUp, color: 'text-red-500', text: 'עלייה בהוצאות' } :
    { icon: TrendingDown, color: 'text-green-500', text: 'ירידה בהוצאות' };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>מגמות חודשיות</CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          מגמות חודשיות
          {monthlyData && monthlyData.length >= 2 && (
            <div className={`flex items-center gap-1 text-sm ${trend.color}`}>
              <trend.icon className="w-4 h-4" />
              {trend.text}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] px-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={monthlyData}
            margin={{ top: 30, right: 40, left: 40, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month"
              tick={{ fill: '#374151', fontSize: 14 }}
              tickMargin={10}
            />
            <YAxis 
              width={80}
              tickFormatter={(value) => `₪${value}`}
              tick={{ fill: '#374151', fontSize: 14 }}
              tickMargin={10}
            />
            <Tooltip 
              formatter={(value) => `₪${value}`}
              contentStyle={{ direction: 'rtl', fontSize: '14px', padding: '10px' }}
              wrapperStyle={{ zIndex: 1000 }}
            />
            <Bar 
              dataKey="total" 
              fill="#47d193"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
              label={{ 
                position: 'top',
                formatter: (value) => `₪${value}`,
                fill: '#374151',
                fontSize: 14,
                dy: -10
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};