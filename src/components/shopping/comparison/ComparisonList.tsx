import { ScrollArea } from "@/components/ui/scroll-area";
import { StoreCard } from "./StoreCard";
import { StoreComparison } from "@/types/shopping";

interface ComparisonListProps {
  comparisons: StoreComparison[];
  cheapestTotal: number;
  mostExpensiveTotal: number;
  branchInfo: Record<string, any>;
}

export const ComparisonList = ({ 
  comparisons, 
  cheapestTotal, 
  mostExpensiveTotal,
  branchInfo 
}: ComparisonListProps) => {
  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        {comparisons.map((comparison, index) => {
          const isComplete = comparison.items.every(item => item.isAvailable);
          const priceDiff = isComplete && cheapestTotal > 0 ? 
            ((comparison.total - cheapestTotal) / cheapestTotal * 100).toFixed(1) : 
            null;
          const progressValue = mostExpensiveTotal > 0 ? 
            (comparison.total / mostExpensiveTotal) * 100 : 
            0;
          
          const branchData = branchInfo?.[comparison.storeId || ''] || {};
          
          return (
            <StoreCard
              key={`${comparison.storeName}-${comparison.storeId}-${index}`}
              comparison={comparison}
              isComplete={isComplete}
              isCheapest={isComplete && comparison.total === cheapestTotal}
              priceDiff={priceDiff}
              progressValue={progressValue}
              index={index}
              branchName={branchData.name || comparison.branchName}
              branchAddress={branchData.address}
              chainName={branchData.chainName || comparison.storeName}
              logoUrl={branchData.logoUrl}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
};