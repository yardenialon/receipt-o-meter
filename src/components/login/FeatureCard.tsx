import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  stat: string;
}

export const FeatureCard = ({ icon: Icon, title, description, stat }: FeatureCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative p-3 md:p-6 rounded-2xl bg-white/70 backdrop-blur-lg shadow-xl border border-white/20 overflow-hidden h-full min-h-[160px] md:min-h-[180px] touch-manipulation"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-400/5 via-blue-400/5 to-indigo-400/5" />
      <Icon className="h-5 w-5 md:h-8 md:w-8 text-primary-500 mb-2 md:mb-4" />
      <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2">{title}</h3>
      <p className="text-xs md:text-base text-gray-600 mb-2 md:mb-4">{description}</p>
      <p className="text-xs md:text-base text-primary-600 font-bold">{stat}</p>
    </motion.div>
  );
};