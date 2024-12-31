import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { calculateSimilarity } from '@/utils/textSimilarity';

interface ShoppingListItem {
  name: string;
  is_completed?: boolean;
  quantity?: number;
}

export const useShoppingListPrices = (items: ShoppingListItem[] = []) => {
  return useQuery({
    queryKey: ['shopping-list-prices', items.map(i => `${i.name}-${i.quantity || 1}`).join(',')],
    queryFn: async () => {
      if (!items.length) return [];

      const activeItems = items.filter(item => !item.is_completed);
      if (!activeItems.length) return [];

      console.log('Active items to compare:', activeItems);

      // Get all store products that match any of our items using text similarity
      const { data: products, error } = await supabase
        .from('store_products_import')
        .select('*')
        .or(
          activeItems.map(item => 
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

      // Get all unique store chains and their store IDs
      const storeKeys = [...new Set(products.map(p => `${p.store_chain}-${p.store_id}`))];
      console.log('All store keys found:', storeKeys);

      // Initialize comparisons for all stores
      const allStoreComparisons = storeKeys.map(storeKey => {
        const [chain, storeId] = storeKey.split('-');
        const storeProducts = products.filter(p => 
          p.store_chain === chain && 
          p.store_id === storeId
        );
        
        console.log(`Processing ${chain} (Store ID: ${storeId}), found ${storeProducts.length} products`);
        
        // Initialize store comparison with all items marked as unavailable
        const comparison = {
          storeName: chain,
          storeId: storeId,
          items: activeItems.map(item => ({
            name: item.name,
            price: null,
            matchedProduct: '',
            quantity: item.quantity || 1,
            isAvailable: false
          })),
          total: 0,
          availableItemsCount: 0
        };

        // Process each item for this store
        comparison.items.forEach((item, index) => {
          // Find matching products using text similarity
          const matchingProducts = storeProducts
            .map(product => ({
              product,
              similarity: calculateSimilarity(item.name, product.ItemName)
            }))
            .filter(match => match.similarity > 0.6) // Adjust threshold as needed
            .sort((a, b) => b.similarity - a.similarity);

          console.log(`Found ${matchingProducts.length} matching products for ${item.name} in ${chain}`);

          if (matchingProducts.length > 0) {
            // Use the best matching product
            const bestMatch = matchingProducts[0].product;
            comparison.items[index] = {
              ...item,
              price: bestMatch.ItemPrice,
              matchedProduct: bestMatch.ItemName,
              isAvailable: true
            };
            comparison.total += bestMatch.ItemPrice * item.quantity;
            comparison.availableItemsCount++;
          }
        });

        return comparison;
      });

      // Sort comparisons by total price and availability
      const sortedComparisons = allStoreComparisons.sort((a, b) => {
        // If both stores have the same number of available items, sort by price
        if (a.availableItemsCount === b.availableItemsCount) {
          return a.total - b.total;
        }
        // Otherwise, prioritize stores with more available items
        return b.availableItemsCount - a.availableItemsCount;
      });

      console.log('Final sorted comparisons:', sortedComparisons);
      
      return sortedComparisons;
    },
    enabled: items.length > 0,
    refetchInterval: 60000, // Refresh every minute
    retry: 3,
    staleTime: 30000,
  });
};
