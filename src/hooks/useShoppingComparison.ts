
import { StoreComparison } from "@/types/shopping";
import { useNormalizedComparisons } from "./comparison/useNormalizedComparisons";
import { useStoreChainInfo, useStoreBranchInfo } from "./comparison/useStoreInfo";
import { useComparisonData } from "./comparison/useComparisonData";

/**
 * Main hook for shopping comparison data processing
 */
export const useShoppingComparison = (comparisons: StoreComparison[]) => {
  // Log initial comparisons
  console.log('Initial comparisons received:', comparisons?.length || 0);

  if (comparisons?.length > 0) {
    console.log('Stores received in comparisons:');
    comparisons.forEach(comp => {
      console.log(`Store: ${comp.storeName}, Available Items: ${comp.availableItemsCount}/${comp.items.length}, Total: ${comp.total}`);
    });
  }

  // Step 1: Normalize the comparisons data
  const normalizedComparisons = useNormalizedComparisons(comparisons);

  // Step 2: Get store IDs for branch info query
  const storeIds = normalizedComparisons
    .map(c => c.storeId || '')
    .filter(Boolean);
  
  // Step 3: Fetch store chain info (logos, etc.)
  const { data: chainInfo } = useStoreChainInfo();
  
  // Step 4: Fetch branch information
  const { data: branchInfo } = useStoreBranchInfo(storeIds);
  
  // Step 5: Process the data to calculate savings, etc.
  const {
    enhancedComparisons,
    completeBaskets,
    cheapestTotal,
    mostExpensiveTotal,
    potentialSavings,
    savingsPercentage
  } = useComparisonData(normalizedComparisons, chainInfo, branchInfo);

  return {
    enhancedComparisons,
    completeBaskets,
    cheapestTotal,
    mostExpensiveTotal,
    potentialSavings,
    savingsPercentage,
    branchInfo: branchInfo || {}
  };
};
