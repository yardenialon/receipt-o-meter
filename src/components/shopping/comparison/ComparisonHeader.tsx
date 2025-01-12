import { SavingsCard } from "./SavingsCard";
import { AnimatePresence } from "framer-motion";

interface ComparisonHeaderProps {
  potentialSavings: number;
  savingsPercentage: string;
  storeName: string;
  storeId: string | null;
  completeBaskets: number;
}

export const ComparisonHeader = ({ 
  potentialSavings, 
  savingsPercentage, 
  storeName, 
  storeId,
  completeBaskets
}: ComparisonHeaderProps) => {
  if (potentialSavings <= 0 || completeBaskets <= 1) {
    return null;
  }

  return (
    <AnimatePresence>
      <SavingsCard
        potentialSavings={potentialSavings}
        savingsPercentage={savingsPercentage}
        storeName={storeName}
        storeId={storeId}
      />
    </AnimatePresence>
  );
};