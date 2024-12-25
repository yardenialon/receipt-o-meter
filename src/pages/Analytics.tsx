import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { MonthlyTrends } from '@/components/analytics/MonthlyTrends';
import { SpendingByCategory } from '@/components/analytics/SpendingByCategory';
import { TopStores } from '@/components/analytics/TopStores';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

const Analytics = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  
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

  // Handle loading state
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

  // Redirect if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">תובנות חכמות</h1>
          <p className="text-lg text-primary-600 font-medium">
            סה"כ צברת {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(totalRefundable || 0)} להחזר
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-full lg:col-span-2">
            <MonthlyTrends />
          </div>
          <div className="col-span-full md:col-span-1">
            <SpendingByCategory />
          </div>
          <div className="col-span-full">
            <TopStores />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;