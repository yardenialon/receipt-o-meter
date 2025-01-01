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
      className="relative p-4 md:p-6 rounded-2xl bg-white/70 backdrop-blur-lg shadow-xl border border-white/20 overflow-hidden h-full min-h-[180px] touch-manipulation"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-400/5 via-blue-400/5 to-indigo-400/5" />
      <Icon className="h-6 w-6 md:h-8 md:w-8 text-primary-500 mb-3 md:mb-4" />
      <h3 className="text-base md:text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">{description}</p>
      <p className="text-sm md:text-base text-primary-600 font-bold">{stat}</p>
    </motion.div>
  );
};