import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, CalendarClock, TrendingUp } from 'lucide-react';

export const ReceiptStats = () => {
  const { data: stats } = useQuery({
    queryKey: ['receipt-stats'],
    queryFn: async () => {
      // Get start of current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Get total receipts count and sum
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('receipts')
        .select('total')
        .gte('created_at', startOfMonth.toISOString());

      if (monthlyError) throw monthlyError;

      // Calculate monthly stats
      const monthlyTotal = monthlyData.reduce((sum, receipt) => sum + (receipt.total || 0), 0);
      const receiptCount = monthlyData.length;

      // Calculate average purchases per week
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
          <CardTitle className="text-sm font-medium">קבלות שנסרקו החודש</CardTitle>
          <Receipt className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.receiptCount || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">סה״כ הוצאות החודש</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₪{stats?.monthlyTotal?.toLocaleString() || 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">קניות בשבוע בממוצע</CardTitle>
          <CalendarClock className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.purchasesPerWeek || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
};