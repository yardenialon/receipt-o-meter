import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useIsMobile } from '@/hooks/use-mobile';

export const TopStores = () => {
  const isMobile = useIsMobile();

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
      <Card className="backdrop-blur-sm bg-white/40">
        <CardHeader>
          <CardTitle>חנויות מובילות</CardTitle>
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
        <CardTitle className="text-lg sm:text-xl">חנויות מובילות</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[400px] sm:h-[400px] w-full px-4 sm:px-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={storeData} 
            layout="vertical"
            margin={{ 
              top: 10, 
              right: isMobile ? 70 : 90, 
              left: isMobile ? 120 : 140, 
              bottom: 10 
            }}
            barSize={40}
            barGap={16}
          >
            <defs>
              <linearGradient id="storeBarGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#34D399" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E5E7EB" 
              horizontal={!isMobile}
              vertical={isMobile}
            />
            <XAxis 
              type="number"
              tickFormatter={(value) => `₪${value}`}
              tick={{ 
                fill: '#374151',
                fontSize: isMobile ? 14 : 16,
              }}
              tickMargin={8}
              domain={[0, 'dataMax']}
              padding={{ left: 0, right: 20 }}
              aria-label="סכום בשקלים"
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={isMobile ? 110 : 130}
              tick={{ 
                fill: '#374151',
                fontSize: isMobile ? 14 : 16,
                textAnchor: 'end',
              }}
              tickFormatter={(value) => 
                value.length > 20 ? `${value.substring(0, 17)}...` : value
              }
              tickMargin={8}
              aria-label="שמות חנויות"
            />
            <Tooltip 
              formatter={(value) => `₪${value}`}
              contentStyle={{ 
                direction: 'rtl',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: isMobile ? '14px' : '16px',
                padding: '12px 16px',
              }}
              wrapperStyle={{ 
                zIndex: 1000,
                width: isMobile ? '100%' : 'auto',
                maxWidth: isMobile ? 'calc(100vw - 32px)' : '300px',
                touchAction: 'none',
              }}
              position={{ x: 0, y: 0 }}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
            <Bar 
              dataKey="total" 
              fill="url(#storeBarGradient)"
              isAnimationActive={true}
              animationDuration={400}
              animationEasing="ease-in-out"
              radius={[0, 6, 6, 0]}
              minPointSize={30}
              label={{ 
                position: 'right',
                formatter: (value) => `₪${value}`,
                fill: '#374151',
                fontSize: isMobile ? 14 : 16,
                dx: 8,
              }}
              role="graphics-symbol"
              aria-label="סכום קניות בחנות"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};