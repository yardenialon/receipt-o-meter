
import { StoreComparison } from "@/types/shopping";
import { ComparisonHeader } from "./comparison/ComparisonHeader";
import { ComparisonList } from "./comparison/ComparisonList";
import { LoadingDisplay } from "./comparison/LoadingDisplay";
import { EmptyState } from "./comparison/EmptyState";
import { useShoppingComparison } from "@/hooks/useShoppingComparison";

interface PriceComparisonProps {
  comparisons: StoreComparison[];
  isLoading?: boolean;
}

export const ShoppingListPriceComparison = ({ comparisons, isLoading }: PriceComparisonProps) => {
  // Handle loading state
  if (isLoading) {
    return <LoadingDisplay />;
  }

  // Handle empty state
  if (!comparisons || comparisons.length === 0) {
    return <EmptyState />;
  }

  // Use our custom hook to process the comparison data
  const {
    enhancedComparisons,
    completeBaskets,
    cheapestTotal,
    mostExpensiveTotal,
    potentialSavings,
    savingsPercentage,
    branchInfo
  } = useShoppingComparison(comparisons);

  return (
    <div className="space-y-6">
      <ComparisonHeader
        potentialSavings={potentialSavings}
        savingsPercentage={savingsPercentage}
        storeName={completeBaskets[0]?.chainName || completeBaskets[0]?.storeName}
        storeId={completeBaskets[0]?.storeId}
        completeBaskets={completeBaskets.length}
      />

      <ComparisonList
        comparisons={enhancedComparisons}
        cheapestTotal={cheapestTotal}
        mostExpensiveTotal={mostExpensiveTotal}
        branchInfo={branchInfo}
      />
    </div>
  );
};
