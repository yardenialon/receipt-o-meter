import { motion } from 'framer-motion';

export const SocialProof = () => {
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <p className="text-base md:text-lg font-medium text-gray-700">
        מצטרפים אלינו כבר יותר מ-1000 משתמשים
      </p>
      <p className="text-base md:text-lg text-gray-600">
        שחוסכים בממוצע 20% בהוצאות על מזון
      </p>
    </motion.div>
  );
};