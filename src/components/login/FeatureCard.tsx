import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  stat: string;
}

export const FeatureCard = ({ icon: Icon, title, description, stat }: FeatureCardProps) => {
  return (
    <motion.div
      className="relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-primary-100/50 hover:border-primary-200 transition-all duration-300 hover:shadow-xl"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-primary-50 rounded-xl">
          <Icon className="w-8 h-8 text-primary-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
            {title}
          </h3>
          <p className="text-base md:text-lg text-gray-600">
            {description}
          </p>
          <p className="text-base md:text-lg font-medium text-primary-600">
            {stat}
          </p>
        </div>
      </div>
    </motion.div>
  );
};