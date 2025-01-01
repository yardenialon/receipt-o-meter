import { AuthSection } from './AuthSection';
import { FeaturesGrid } from './FeaturesGrid';
import { SocialProof } from './SocialProof';
import { BillBeLogo } from '../BillBeLogo';

export const LoginHero = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-1 md:px-2 py-6 md:py-12">
        <div className="flex flex-col items-center justify-center text-center space-y-8">
          <BillBeLogo size={225} className="mb-4" />
          
          <div className="max-w-3xl space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
              הדרך החכמה לחסוך בקניות ולשמור על המזון שלכם
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              אפליקציה חכמה שעוזרת לכם לחסוך כסף בקניות ולנהל את המזון בצורה חכמה יותר
            </p>
          </div>

          <AuthSection />
          <FeaturesGrid />
          <SocialProof />
        </div>
      </div>
    </div>
  );
};