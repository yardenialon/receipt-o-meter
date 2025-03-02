
import { WeeklyDealsCard } from '@/components/home/cards/WeeklyDealsCard';
import { PricingTrendsCard } from '@/components/home/cards/PricingTrendsCard';
import { TopProductsCard } from '@/components/home/cards/TopProductsCard';

export function SmartInfoSection() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">מידע חכם לצרכן</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* מבצעי השבוע */}
          <WeeklyDealsCard />
          
          {/* מוצרים בעליית מחירים */}
          <PricingTrendsCard />
          
          {/* מוצרים הכי נמכרים */}
          <TopProductsCard />
        </div>
      </div>
    </div>
  );
}
