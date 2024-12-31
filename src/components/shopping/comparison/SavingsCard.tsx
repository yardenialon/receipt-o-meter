import { Card } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface SavingsCardProps {
  potentialSavings: number;
  savingsPercentage: string;
  storeName: string;
  storeId: string | null;
}

export const SavingsCard = ({ potentialSavings, savingsPercentage, storeName, storeId }: SavingsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-100">
        <div className="flex items-center gap-3 text-green-700">
          <div className="p-3 bg-green-100 rounded-full">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-xl font-semibold">חיסכון פוטנציאלי</h4>
            <p className="text-sm">
              ניתן לחסוך עד ₪{potentialSavings.toFixed(2)} ({savingsPercentage}%) בקנייה ברשת {storeName}
              {storeId && ` (סניף ${storeId})`}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};