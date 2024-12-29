import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const MonthlyTrends = () => {
  const isMobile = useIsMobile();
  
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
      <Card className="backdrop-blur-sm bg-white/40">
        <CardHeader>
          <CardTitle>מגמות חודשיות</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-white/40 transition-all duration-300 hover:bg-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          מגמות חודשיות
          {monthlyData && monthlyData.length >= 2 && (
            <div className={`flex items-center gap-1 text-sm ${trend.color}`}>
              <trend.icon className="w-4 h-4" />
              {trend.text}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={monthlyData}
            margin={{ 
              top: 20, 
              right: isMobile ? 20 : 30, 
              left: isMobile ? 20 : 30, 
              bottom: 20 
            }}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#34D399" stopOpacity={0.4}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="month"
              tick={{ 
                fill: '#374151',
                fontSize: isMobile ? 12 : 14,
              }}
              tickMargin={12}
            />
            <YAxis 
              width={50}
              tickFormatter={(value) => `₪${value}`}
              tick={{ 
                fill: '#374151',
                fontSize: isMobile ? 12 : 14,
              }}
              tickMargin={8}
            />
            <Tooltip 
              formatter={(value) => `₪${value}`}
              contentStyle={{ 
                direction: 'rtl',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: isMobile ? '14px' : '16px',
              }}
              wrapperStyle={{ zIndex: 1000 }}
            />
            <Bar 
              dataKey="total" 
              fill="url(#barGradient)"
              isAnimationActive={true}
              animationDuration={400}
              animationEasing="ease-in-out"
              radius={[4, 4, 0, 0]}
              label={{ 
                position: 'top',
                formatter: (value) => `₪${value}`,
                fill: '#374151',
                fontSize: isMobile ? 12 : 14,
                dy: -10,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};