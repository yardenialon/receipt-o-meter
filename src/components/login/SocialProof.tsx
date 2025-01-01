import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface TestimonialCardProps {
  text: string;
  author: string;
}

const TestimonialCard = ({ text, author }: TestimonialCardProps) => (
  <motion.div
    className="min-w-[280px] md:min-w-[300px] p-4 mx-4 rounded-xl bg-white/60 backdrop-blur-sm shadow-lg"
    whileHover={{ scale: 1.02 }}
  >
    <p className="text-gray-700 mb-2 text-sm md:text-base">{text}</p>
    <p className="text-primary-600 font-semibold text-sm">{author}</p>
  </motion.div>
);

export const SocialProof = () => {
  return (
    <motion.div 
      className="text-center mb-12 md:mb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
        <Users className="h-5 w-5 md:h-6 md:w-6 text-primary-500" />
        <p className="text-lg md:text-xl font-semibold">
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