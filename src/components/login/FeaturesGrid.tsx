import { Camera, TrendingUp, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import { FeatureCard } from './FeatureCard';

export const FeaturesGrid = () => {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8 mb-8 md:mb-16 px-4 md:px-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <FeatureCard
        icon={Camera}
        title="סריקת קבלות"
        description="סרקו קבלות וקבלו תובנות חכמות"
        stat="חיסכון ממוצע של 20%"
      />
      <FeatureCard
        icon={TrendingUp}
        title="השוואת מחירים"
        description="מצאו את הסל הזול ביותר"
        stat="השוואה בין 5 רשתות"
      />
      <FeatureCard
        icon={Leaf}
        title="ניהול מזון"
        description="הצילו מזון, חסכו כסף"
        stat="3,800 ₪ חיסכון שנתי"
      />
    </motion.div>
  );
};