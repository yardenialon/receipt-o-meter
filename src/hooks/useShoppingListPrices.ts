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
        .from('store_products')
        .select('*')
        .or(
          activeItems.map(item => 
            `product_name.ilike.%${item.name}%`
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

      // Get unique store chains
      const storeChains = [...new Set(products.map(p => p.store_chain))].slice(0, 5);

      // Initialize store comparisons
      const storeComparisons = storeChains.map(chain => ({
        storeName: chain,
        storeId: null, // We could add store selection later
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
        
        // Match items to products
        store.items.forEach((item, index) => {
          // Find best matching product for this item in this store
          const matchingProducts = storeProducts.filter(p => 
            p.product_name.toLowerCase().includes(item.name.toLowerCase()) ||
            item.name.toLowerCase().includes(p.product_name.toLowerCase())
          );

          if (matchingProducts.length > 0) {
            // Use the cheapest matching product
            const cheapestProduct = matchingProducts.reduce((min, p) => 
              p.price < min.price ? p : min
            );

            store.items[index] = {
              ...item,
              price: cheapestProduct.price,
              matchedProduct: cheapestProduct.product_name,
              isAvailable: true
            };

            // Add to total only if product is available
            store.total += cheapestProduct.price * item.quantity;
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