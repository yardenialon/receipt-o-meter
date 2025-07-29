
import { StoreComparison } from "@/types/shopping";
import { normalizeChainName } from "@/utils/shopping/storeNameUtils";

export interface ComparisonData {
  enhancedComparisons: StoreComparison[];
  completeBaskets: StoreComparison[];
  cheapestTotal: number;
  mostExpensiveTotal: number;
  potentialSavings: number;
  savingsPercentage: string;
}

/**
 * Hook to process comparison data and calculate savings
 */
export const useComparisonData = (
  comparisons: StoreComparison[], 
  chainInfo?: Record<string, {name: string, logoUrl: string | null}>,
  branchInfo?: Record<string, any>
): ComparisonData => {
  // Validate input
  if (!comparisons || comparisons.length === 0) {
    return {
      enhancedComparisons: [],
      completeBaskets: [],
      cheapestTotal: 0,
      mostExpensiveTotal: 0,
      potentialSavings: 0,
      savingsPercentage: "0"
    };
  }

  // Enhance comparisons with chain and branch data
  const enhancedComparisons = comparisons.map(comparison => {
    // Try to get logo URL from branch info first
    const branchData = comparison.storeId ? branchInfo?.[comparison.storeId] : null;
    
    // If we couldn't get from branch info, try from chain info
    const chainData = chainInfo?.[comparison.storeName];
    
    // Use chain name from branch data if available, otherwise use the normalized name
    const displayChainName = branchData?.chainName || comparison.storeName;
    
    // Use logo URL from branch data if available, otherwise use from chain data
    const logoUrl = branchData?.logoUrl || chainData?.logoUrl;
    
    return {
      ...comparison,
      chainName: displayChainName,
      logoUrl
    };
  });

  // Filter for complete baskets (all items available)
  const completeBaskets = enhancedComparisons.filter(store => 
    store.availableItemsCount === store.items.length
  );

  console.log('Complete baskets:', completeBaskets.map(c => c.storeName));

  // Calculate savings - only for complete baskets
  let cheapestTotal = 0;
  let mostExpensiveTotal = 0;
  let potentialSavings = 0;
  let savingsPercentage = "0";
  
  if (completeBaskets.length > 0) {
    cheapestTotal = Math.min(...completeBaskets.map(c => c.total));
    mostExpensiveTotal = Math.max(...completeBaskets.map(c => c.total));
    potentialSavings = mostExpensiveTotal - cheapestTotal;
    savingsPercentage = ((potentialSavings / mostExpensiveTotal) * 100).toFixed(1);
  } else {
    // If no complete baskets, calculate values for all baskets (but note comparison is partial)
    if (enhancedComparisons.length > 0) {
      cheapestTotal = Math.min(...enhancedComparisons.map(c => c.total));
      mostExpensiveTotal = Math.max(...enhancedComparisons.map(c => c.total));
      potentialSavings = mostExpensiveTotal - cheapestTotal;
      savingsPercentage = ((potentialSavings / mostExpensiveTotal) * 100).toFixed(1);
    }
  }

  return {
    enhancedComparisons,
    completeBaskets,
    cheapestTotal,
    mostExpensiveTotal,
    potentialSavings,
    savingsPercentage
  };
};
