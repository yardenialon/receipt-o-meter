import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { MonthlyTrends } from '@/components/analytics/MonthlyTrends';
import { SpendingByCategory } from '@/components/analytics/SpendingByCategory';
import { TopStores } from '@/components/analytics/TopStores';
import { ProductRecommendations } from '@/components/analytics/ProductRecommendations';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';

const Analytics = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const isMobile = useIsMobile();
  
  const { data: totalRefundable } = useQuery({
    queryKey: ['total-refundable'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receipts')
        .select('total_refundable')
        .eq('user_id', user?.id);

      if (error) throw error;

      return data.reduce((sum, receipt) => sum + (receipt.total_refundable || 0), 0);
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-[65deg] from-primary-50 via-blue-50 to-white p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center backdrop-blur-sm bg-white/30 rounded-2xl p-6 shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">תובנות חכמות</h1>
          <p className="text-lg sm:text-xl text-primary-600 font-medium">
            סה"כ צברת {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(totalRefundable || 0)} להחזר
          </p>
        </header>
        
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-full lg:col-span-2 space-y-6 sm:space-y-8">
            <MonthlyTrends />
            <TopStores />
          </div>
          <div className="col-span-full lg:col-span-1 space-y-6 sm:space-y-8">
            <SpendingByCategory />
            <ProductRecommendations />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;