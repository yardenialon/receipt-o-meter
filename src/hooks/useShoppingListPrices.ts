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

      // Get all store products that match any of our items from the store_products_import table
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

      // Get all unique store chains
      const allStoreChains = [...new Set(products.map(p => p.store_chain))];
      console.log('All store chains found:', allStoreChains);

      // Initialize comparisons for all stores
      const allStoreComparisons = allStoreChains.map(chain => {
        const storeProducts = products.filter(p => p.store_chain === chain);
        console.log(`Processing ${chain}, found ${storeProducts.length} products`);
        
        const comparison = {
          storeName: chain,
          storeId: storeProducts[0]?.store_id || null,
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

        // Process items for this store
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

      // Filter stores that have at least one available item and sort by total price
      const validComparisons = allStoreComparisons
        .filter(store => store.availableItemsCount > 0)
        .sort((a, b) => a.total - b.total);

      console.log('Final comparison results:', validComparisons);
      return validComparisons;
    },
    enabled: items.length > 0
  });
};