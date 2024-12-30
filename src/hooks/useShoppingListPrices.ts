import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { findMatchingProducts } from '@/utils/productMatching';

interface ShoppingListItem {
  name: string;
  is_completed?: boolean;
}

export const useShoppingListPrices = (items: ShoppingListItem[] = []) => {
  return useQuery({
    queryKey: ['shopping-list-prices', items.map(i => i.name).join(',')],
    queryFn: async () => {
      if (!items.length) return [];

      const activeItems = items.filter(item => !item.is_completed);
      if (!activeItems.length) return [];

      console.log('Active items to compare:', activeItems);

      // Get all store products that match any of our items
      const { data: products, error } = await supabase
        .from('store_products_import')
        .select('*');

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      if (!products?.length) {
        console.log('No products found in database');
        return [];
      }

      console.log('Found products:', products.length);

      // Initialize store products map
      const storeProducts: Record<string, {
        storeName: string;
        storeId: string | null;
        items: any[];
        total: number;
      }> = {};

      // Create a map to track quantities of each item
      const itemQuantities = activeItems.reduce((acc, item) => {
        acc[item.name] = (acc[item.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Process each unique item
      const uniqueItems = [...new Set(activeItems.map(item => item.name))];
      for (const itemName of uniqueItems) {
        const quantity = itemQuantities[itemName];
        findMatchingProducts(itemName, quantity, products, storeProducts);
      }

      // Convert to array and filter stores that have matches
      const results = Object.values(storeProducts)
        .filter(store => store.items.length > 0)
        .sort((a, b) => a.total - b.total);

      console.log('Final comparison results:', results);
      return results;
    },
    enabled: items.length > 0
  });
};