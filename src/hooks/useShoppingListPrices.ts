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
          activeItems.map(item => {
            // Split the item name into words and create a search condition for each significant word
            const searchWords = item.name
              .split(' ')
              .filter(word => word.length > 2) // Filter out short words
              .map(word => `ItemName.ilike.%${word}%`);
            return searchWords.join(','); // Join with OR condition
          }).join(',')
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
          
          // Split both names into words and check for significant word matches
          const itemWords = item.name.toLowerCase().split(' ').filter(w => w.length > 2);
          const productWords = p.ItemName.toLowerCase().split(' ').filter(w => w.length > 2);
          
          // Count matching words
          const matchingWords = itemWords.filter(word => 
            productWords.some(pWord => pWord.includes(word) || word.includes(pWord))
          );
          
          // Require at least 50% of words to match
          return matchingWords.length >= Math.ceil(itemWords.length * 0.5);
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