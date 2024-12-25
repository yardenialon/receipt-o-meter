import { MonthlyTrends } from '@/components/analytics/MonthlyTrends';
import { SpendingByCategory } from '@/components/analytics/SpendingByCategory';
import { TopStores } from '@/components/analytics/TopStores';

const Insights = () => {
  return (
    <div className="p-6 space-y-6 w-full">
      <h1 className="text-2xl font-bold mb-6">תובנות</h1>
      <div className="grid gap-6">
        <MonthlyTrends />
        <div className="grid md:grid-cols-2 gap-6">
          <SpendingByCategory />
          <TopStores />
        </div>
      </div>
    </div>
  );
};

export default Insights;