
import { HeroSection } from '@/components/home/HeroSection';
import { StoreLogosSection } from '@/components/home/StoreLogosSection';
import { CategorySection } from '@/components/home/CategorySection';
import { SmartInfoSection } from '@/components/home/SmartInfoSection';
import { AnalyticsSection } from '@/components/home/AnalyticsSection';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* סליידר לוגואים */}
      <StoreLogosSection />

      {/* קטגוריות מובילות */}
      <CategorySection />

      {/* בלוקים חכמים */}
      <SmartInfoSection />

      {/* חלק מעודכן מהעיצוב הקודם - המלצות והשוואות */}
      <AnalyticsSection />
    </div>
  );
}
