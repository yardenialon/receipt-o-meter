import { SpendingByCategory } from "@/components/analytics/SpendingByCategory";
import { MonthlyTrends } from "@/components/analytics/MonthlyTrends";
import { TopStores } from "@/components/analytics/TopStores";

const Insights = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">תובנות והוצאות</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SpendingByCategory />
        <MonthlyTrends />
        <TopStores />
      </div>
    </div>
  );
};

export default Insights;