
import { useQuery } from '@tanstack/react-query';
import { ShoppingListItem, StoreComparison } from '@/types/shopping';
import { groupProductsByStore, processStoreComparisons } from '@/utils/shopping/productUtils';
import { searchProducts, logProductDebugInfo } from '@/utils/shopping/productSearchUtils';

export const useShoppingListPrices = (items: ShoppingListItem[] = []) => {
  return useQuery({
    queryKey: ['shopping-list-prices', items.map(i => `${i.name}-${i.quantity || 1}-${i.product_code || ''}`).join(',')],
    queryFn: async () => {
      if (!items.length) return [];

      const activeItems = items.filter(item => !item.is_completed);
      if (!activeItems.length) return [];

      console.log('Active items to compare:', activeItems);

      // Search for all products matching the shopping list items
      const products = await searchProducts(activeItems);
      
      if (!products.length) {
        console.log('No matching products found');
        return [];
      }

      // Log debug information about found products
      logProductDebugInfo(products);

      // Group products by store
      const productsByStore = groupProductsByStore(products);
      console.log('Products grouped by store:', Object.keys(productsByStore));
      
      // Process store comparisons
      const storesWithItems = processStoreComparisons(
        productsByStore,
        activeItems,
        products
      );

      console.log('Final stores with items:', storesWithItems.length, storesWithItems.map(s => 
        `${s.storeName} (${s.availableItemsCount}/${s.items.length}, total: ${s.total})`
      ));
      
      return storesWithItems;
    },
    enabled: items.length > 0,
    refetchInterval: false,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};
