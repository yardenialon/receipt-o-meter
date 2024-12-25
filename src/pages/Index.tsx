import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import UploadZone from '@/components/UploadZone';
import ReceiptList from '@/components/ReceiptList';
import { BillBeLogo } from '@/components/BillBeLogo';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  
  const { data: monthlyStats } = useQuery({
    queryKey: ['monthly-stats'],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: receipts, error } = await supabase
        .from('receipts')
        .select('total, created_at')
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;

      const total = receipts.reduce((sum, receipt) => sum + (receipt.total || 0), 0);
      const count = receipts.length;

      return {
        total,
        count,
        month: startOfMonth.toLocaleString('he-IL', { month: 'long' })
      };
    }
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

  const username = user.email?.split('@')[0] || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center gap-6 mb-12">
          <BillBeLogo size={64} className="text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              ניהול קבלות
            </h1>
            <div className="flex flex-col gap-1.5">
              <p className="text-xl font-medium text-gray-700">
                שלום {username}
              </p>
              <p className="text-sm text-gray-500">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {monthlyStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">סה"כ הוצאות {monthlyStats.month}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary-600">
                  ₪{monthlyStats.total.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">מספר קבלות החודש</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary-600">
                  {monthlyStats.count}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <UploadZone />
        <ReceiptList />
      </div>
    </div>
  );
};

export default Index;