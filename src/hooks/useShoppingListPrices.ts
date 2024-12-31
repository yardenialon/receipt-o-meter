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

      // Get all store products that match any of our items from the import table
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

      // Get unique store chains (limit to 5 as requested)
      const storeChains = [...new Set(products.map(p => p.store_chain))].slice(0, 5);
      console.log('Store chains found:', storeChains);

      // Initialize store comparisons
      const storeComparisons = storeChains.map(chain => ({
        storeName: chain,
        storeId: null,
        items: activeItems.map(item => ({
          name: item.name,
          price: null,
          matchedProduct: '',
          quantity: item.quantity || 1,
          isAvailable: false
        })),
        total: 0
      }));

      // Process each store
      storeComparisons.forEach(store => {
        const storeProducts = products.filter(p => p.store_chain === store.storeName);
        console.log(`Processing store ${store.storeName}, found ${storeProducts.length} products`);
        
        // Match items to products
        store.items.forEach((item, index) => {
          // Find best matching product for this item in this store
          const matchingProducts = storeProducts.filter(p => 
            p.ItemName.toLowerCase().includes(item.name.toLowerCase()) ||
            item.name.toLowerCase().includes(p.ItemName.toLowerCase())
          );

          console.log(`Found ${matchingProducts.length} matching products for ${item.name} in ${store.storeName}`);

          if (matchingProducts.length > 0) {
            // Use the cheapest matching product
            const cheapestProduct = matchingProducts.reduce((min, p) => 
              (p.ItemPrice || 0) < (min.ItemPrice || 0) ? p : min
            );

            store.items[index] = {
              ...item,
              price: cheapestProduct.ItemPrice || 0,
              matchedProduct: cheapestProduct.ItemName,
              isAvailable: true
            };

            // Add to total only if product is available and has a price
            if (cheapestProduct.ItemPrice) {
              store.total += cheapestProduct.ItemPrice * item.quantity;
            }
          }
        });
      });

      // Filter out stores with no matches and sort by total price
      const validComparisons = storeComparisons
        .filter(store => store.items.some(item => item.isAvailable))
        .sort((a, b) => a.total - b.total);

      console.log('Final comparison results:', validComparisons);
      return validComparisons;
    },
    enabled: items.length > 0
  });
};