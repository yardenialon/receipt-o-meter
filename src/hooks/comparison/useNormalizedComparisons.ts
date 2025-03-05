
import { StoreComparison } from "@/types/shopping";
import { normalizeChainName } from "@/utils/shopping/storeNameUtils";

/**
 * Normalizes comparison data to ensure consistent naming and totals
 */
export const useNormalizedComparisons = (comparisons: StoreComparison[] = []) => {
  if (!comparisons || comparisons.length === 0) {
    return [];
  }

  // Log initial comparisons
  console.log('Normalizing comparisons data for', comparisons.length, 'stores');

  // Normalize store names for consistent display
  const normalizedComparisons = comparisons.map(comparison => {
    // Normalize store name for consistent display and logo matching
    const normalizedName = normalizeChainName(comparison.storeName);
    
    // Calculate total cost only for available items
    const total = comparison.items.reduce((sum, item) => {
      if (item.isAvailable && item.price !== null) {
        const itemTotal = item.price * (item.quantity || 1);
        return sum + itemTotal;
      }
      return sum;
    }, 0);

    return {
      ...comparison,
      storeName: normalizedName,
      total
    };
  });

  console.log('Normalized comparisons:', normalizedComparisons.map(c => 
    `${c.storeName} (${c.availableItemsCount}/${c.items.length})`
  ));

  return normalizedComparisons;
};
