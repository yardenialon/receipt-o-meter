
import { LogoSlider } from '@/components/logos/LogoSlider';

export function StoreLogosSection() {
  return (
    <div className="py-6 bg-gray-50 border-t border-b border-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-4">רשתות המזון המובילות</h2>
        <LogoSlider />
      </div>
    </div>
  );
}
