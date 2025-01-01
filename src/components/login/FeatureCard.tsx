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
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative p-6 rounded-2xl bg-white/70 backdrop-blur-lg shadow-xl border border-white/20 overflow-hidden h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-400/5 via-blue-400/5 to-indigo-400/5" />
      <Icon className="h-8 w-8 text-primary-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 text-sm md:text-base">{description}</p>
      <p className="text-primary-600 font-bold">{stat}</p>
    </motion.div>
  );
};