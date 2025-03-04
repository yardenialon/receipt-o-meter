
import { LogoSlider } from '@/components/logos/LogoSlider';
import { SavvyLogo } from '@/components/SavvyLogo';

export function StoreLogosSection() {
  return (
    <div className="py-8 bg-gray-50 border-t border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center mb-4">
          <SavvyLogo size={28} className="mr-2" />
          <h2 className="text-xl font-bold text-gray-800 text-center">רשתות המזון המובילות</h2>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm relative">
          <LogoSlider />
        </div>
      </div>
    </div>
  );
}
