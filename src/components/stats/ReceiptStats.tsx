import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, CalendarClock, TrendingUp } from 'lucide-react';

export const ReceiptStats = () => {
  const { data: stats } = useQuery({
    queryKey: ['receipt-stats'],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyData, error: monthlyError } = await supabase
        .from('receipts')
        .select('total')
        .gte('created_at', startOfMonth.toISOString());

      if (monthlyError) throw monthlyError;

      const monthlyTotal = monthlyData.reduce((sum, receipt) => sum + (receipt.total || 0), 0);
      const receiptCount = monthlyData.length;
      const weeksInMonth = Math.ceil((new Date().getDate()) / 7);
      const purchasesPerWeek = receiptCount / weeksInMonth;

      return {
        monthlyTotal,
        receiptCount,
        purchasesPerWeek: purchasesPerWeek.toFixed(1)
      };
    }
  });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base md:text-lg font-medium">קבלות שנסרקו החודש</CardTitle>
          <Receipt className="h-6 w-6 md:h-8 md:w-8 text-primary" strokeWidth={1.5} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold">{stats?.receiptCount || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base md:text-lg font-medium">סה״כ הוצאות החודש</CardTitle>
          <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-primary" strokeWidth={1.5} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold">
            ₪{stats?.monthlyTotal?.toLocaleString() || 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base md:text-lg font-medium">קניות בשבוע בממוצע</CardTitle>
          <CalendarClock className="h-6 w-6 md:h-8 md:w-8 text-primary" strokeWidth={1.5} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold">{stats?.purchasesPerWeek || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
};