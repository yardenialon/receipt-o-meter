import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

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
        .select('*')
        .or(
          activeItems.map(item => 
            // Create a search condition for each item name
            `ItemName.ilike.%${item.name}%`
          ).join(',')
        );

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      if (!products?.length) {
        console.log('No products found in database');
        return [];
      }

      console.log('Found products:', products);

      // Initialize store products map
      const storeProducts: Record<string, {
        storeName: string;
        storeId: string | null;
        items: {
          name: string;
          price: number;
          matchedProduct: string;
          quantity: number;
        }[];
        total: number;
      }> = {};

      // Process each item
      for (const item of activeItems) {
        // Find matching products for this item using fuzzy matching
        const itemMatches = products.filter(p => {
          if (!p.ItemName) return false;
          
          // Convert both names to lowercase for comparison
          const itemNameLower = item.name.toLowerCase();
          const productNameLower = p.ItemName.toLowerCase();
          
          // Check if the product name contains the search term
          // or if the search term contains the product name
          return productNameLower.includes(itemNameLower) || 
                 itemNameLower.includes(productNameLower);
        });

        // Group matches by store
        for (const match of itemMatches) {
          if (!match.store_chain || !match.ItemPrice) continue;

          const storeKey = `${match.store_chain}-${match.store_id || 'main'}`;
          
          if (!storeProducts[storeKey]) {
            storeProducts[storeKey] = {
              storeName: match.store_chain,
              storeId: match.store_id,
              items: [],
              total: 0
            };
          }

          const itemPrice = match.ItemPrice;
          storeProducts[storeKey].items.push({
            name: item.name,
            matchedProduct: match.ItemName || '',
            price: itemPrice,
            quantity: 1
          });
          storeProducts[storeKey].total += itemPrice;
        }
      }

      // Convert to array and filter stores that don't have all items
      const results = Object.values(storeProducts)
        .filter(store => store.items.length === activeItems.length)
        .sort((a, b) => a.total - b.total);

      console.log('Final comparison results:', results);
      return results;
    },
    enabled: items.length > 0
  });
};