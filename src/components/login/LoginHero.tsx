
import { motion } from 'framer-motion';
import { SavvyLogo } from '@/components/SavvyLogo';
import { useIsMobile } from '@/hooks/use-mobile';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { AuthSection } from './AuthSection';

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
  
  return (
    <motion.div 
      className="text-center mb-2 md:mb-8 px-3 md:px-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="flex justify-center mb-4 md:mb-8"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <SavvyLogo size={isMobile ? 200 : 300} className="mb-2 md:mb-4" />
      </motion.div>
      
      <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-primary-600 to-blue-600 text-transparent bg-clip-text">
        נהלו חכם. חסכו יותר.
      </h1>
      
      <p className="text-base md:text-xl text-gray-600 mb-4 md:mb-6 max-w-md mx-auto">
        הדרך החכמה לחסוך בקניות ולשמור על המזון שלכם
      </p>

      {/* Authentication section placed right after the subtitle */}
      <div className="mb-6">
        <AuthSection />
      </div>

      <div className="h-20 md:h-48 mb-4 md:mb-8">
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
