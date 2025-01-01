import { motion } from 'framer-motion';
import { BillBeLogo } from '@/components/BillBeLogo';
import { useIsMobile } from '@/hooks/use-mobile';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

const data = [
  { savings: 4000, waste: 2400, prices: 2400 },
  { savings: 3000, waste: 1398, prices: 2210 },
  { savings: 2000, waste: 9800, prices: 2290 },
  { savings: 2780, waste: 3908, prices: 2000 },
  { savings: 1890, waste: 4800, prices: 2181 },
  { savings: 2390, waste: 3800, prices: 2500 },
  { savings: 3490, waste: 4300, prices: 2100 },
];

export const LoginHero = () => {
  const isMobile = useIsMobile();
  const currentOrigin = window.location.origin;

  const handleGoogleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${currentOrigin}/login`
        }
      });
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <motion.div 
      className="text-center mb-4 md:mb-8 px-1 md:px-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="flex justify-center mb-4 md:mb-6"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <BillBeLogo size={isMobile ? 100 : 180} className="mb-2 md:mb-4" />
      </motion.div>
      
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-primary-600 to-blue-600 text-transparent bg-clip-text">
        נהלו חכם. חסכו יותר.
      </h1>
      
      <p className="text-xl md:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto">
        הדרך החכמה לחסוך בקניות ולשמור על המזון שלכם
      </p>

      <div className="mb-6 md:mb-8">
        <Button
          onClick={handleGoogleSignIn}
          className="w-full max-w-lg mx-auto bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center gap-2 py-6 md:py-6 text-lg md:text-base"
          variant="outline"
        >
          <svg className="size-6 md:size-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-lg md:text-base">הרשמה עם Google</span>
        </Button>
      </div>

      <div className="h-20 md:h-48 mb-4 md:mb-8 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="savings" stroke="#47d193" strokeWidth={isMobile ? 1 : 2} dot={false} />
            <Line type="monotone" dataKey="waste" stroke="#38bdf8" strokeWidth={isMobile ? 1 : 2} dot={false} />
            <Line type="monotone" dataKey="prices" stroke="#818cf8" strokeWidth={isMobile ? 1 : 2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};