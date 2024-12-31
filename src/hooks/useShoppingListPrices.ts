import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

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

      // Get all store products that match any of our items
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
      const storeKeys = [...new Set(products.map(p => `${p.store_chain}-${p.store_id || 'main'}`))];
      console.log('All store keys found:', storeKeys);

      // Initialize comparisons for all stores
      const allStoreComparisons = storeKeys.map(storeKey => {
        const [chain, storeId] = storeKey.split('-');
        const storeProducts = products.filter(p => 
          p.store_chain === chain && 
          (storeId === 'main' || p.store_id === storeId)
        );
        
        console.log(`Processing ${chain} (Store ID: ${storeId}), found ${storeProducts.length} products`);
        
        // Initialize store comparison with all items marked as unavailable
        const comparison = {
          storeName: chain,
          storeId: storeId === 'main' ? null : storeId,
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
          const matchingProducts = storeProducts.filter(p => 
            p.ItemName.toLowerCase().includes(item.name.toLowerCase()) ||
            item.name.toLowerCase().includes(p.ItemName.toLowerCase())
          );

          console.log(`Found ${matchingProducts.length} matching products for ${item.name} in ${chain}`);

          if (matchingProducts.length > 0) {
            // Use the cheapest matching product
            const cheapestProduct = matchingProducts.reduce((min, p) => 
              (!min.ItemPrice || (p.ItemPrice && p.ItemPrice < min.ItemPrice)) ? p : min
            );

            if (cheapestProduct.ItemPrice) {
              comparison.items[index] = {
                ...item,
                price: cheapestProduct.ItemPrice,
                matchedProduct: cheapestProduct.ItemName,
                isAvailable: true
              };
              comparison.total += cheapestProduct.ItemPrice * item.quantity;
              comparison.availableItemsCount++;
            }
          }
        });

        return comparison;
      });

      // Sort comparisons by total price
      const sortedComparisons = allStoreComparisons.sort((a, b) => a.total - b.total);
      console.log('Final sorted comparisons:', sortedComparisons);
      
      return sortedComparisons;
    },
    enabled: items.length > 0,
    refetchInterval: 60000,
    retry: 3,
    staleTime: 30000,
  });
};