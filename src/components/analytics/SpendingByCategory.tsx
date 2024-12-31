import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useIsMobile } from '@/hooks/use-mobile';

const COLORS = ['#34D399', '#38BDF8', '#818CF8', '#F472B6', '#A78BFA'];

export const SpendingByCategory = () => {
  const isMobile = useIsMobile();

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
          receipts(created_at)
        `)
        .gte('receipts.created_at', startOfMonth.toISOString());

      if (error) {
        console.error('Error fetching spending data:', error);
        throw error;
      }

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
        .sort((a, b) => b.value - a.value);
    }
  });

  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/40">
        <CardHeader>
          <CardTitle>הוצאות לפי קטגוריה</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
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
        <CardTitle className="text-lg sm:text-xl">הוצאות לפי קטגוריה</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {COLORS.map((color, index) => (
                  <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0.4}/>
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 40 : 60}
                outerRadius={isMobile ? 80 : 100}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={true}
                animationDuration={400}
                animationEasing="ease-in-out"
              >
                {categoryData?.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#gradient-${index % COLORS.length})`}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
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
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-2 text-sm sm:text-base">
          {categoryData?.map((category, index) => (
            <div 
              key={category.name}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium">{category.name}</span>
              </div>
              <span className="font-mono font-medium tabular-nums">
                {new Intl.NumberFormat('he-IL', { 
                  style: 'currency', 
                  currency: 'ILS',
                  maximumFractionDigits: 0
                }).format(category.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};