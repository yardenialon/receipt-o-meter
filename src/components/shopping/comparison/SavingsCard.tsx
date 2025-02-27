
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface SavingsCardProps {
  potentialSavings: number;
  savingsPercentage: string;
  storeName: string;
  storeId: string | null;
}

export const SavingsCard = ({ 
  potentialSavings, 
  savingsPercentage, 
  storeName, 
  storeId 
}: SavingsCardProps) => {
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-100 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <Sparkles className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">
              חיסכון פוטנציאלי: ₪{potentialSavings.toFixed(2)}
            </h3>
            <p className="text-sm text-green-600">
              חיסכון של {savingsPercentage}% בקנייה ברשת {storeName}
              {storeId && ` (סניף ${storeId})`}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
