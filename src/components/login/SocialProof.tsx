import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface TestimonialCardProps {
  text: string;
  author: string;
}

const TestimonialCard = ({ text, author }: TestimonialCardProps) => (
  <motion.div
    className="min-w-[260px] md:min-w-[300px] p-4 mx-2 md:mx-4 rounded-xl bg-white/60 backdrop-blur-sm shadow-lg"
    whileHover={{ scale: 1.02 }}
  >
    <p className="text-sm md:text-base text-gray-700 mb-2">{text}</p>
    <p className="text-sm text-primary-600 font-semibold">{author}</p>
  </motion.div>
);

export const SocialProof = () => {
  return (
    <motion.div 
      className="text-center mb-8 md:mb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center justify-center gap-2 mb-4 md:mb-8 px-4">
        <Users className="h-4 w-4 md:h-6 md:w-6 text-primary-500" />
        <p className="text-base md:text-xl font-semibold">
          100,000+ משפחות כבר חוסכות איתנו
        </p>
      </div>
      
      <div className="overflow-hidden">
        <motion.div 
          className="flex"
          animate={{ x: [-1200, 1200] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <TestimonialCard
            text="החיסכון הכספי מדהים, ממליצה בחום!"
            author="מיכל כהן"
          />
          <TestimonialCard
            text="האפליקציה עזרה לי להפחית בזבוז מזון"
            author="דוד לוי"
          />
          <TestimonialCard
            text="השוואת המחירים חוסכת לי מאות שקלים בחודש"
            author="רחל אברהם"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};