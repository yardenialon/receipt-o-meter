
import { ProductRecommendations } from '@/components/analytics/ProductRecommendations';
import { TopStores } from '@/components/analytics/TopStores';

export function AnalyticsSection() {
  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">המלצות לחיסכון</h2>
            <ProductRecommendations />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">חנויות מובילות</h2>
            <TopStores />
          </div>
        </div>
      </div>
    </div>
  );
}
