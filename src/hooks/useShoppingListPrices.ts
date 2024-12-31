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

      // First, get the ItemCodes for our items by searching by name
      const { data: itemMatches, error: matchError } = await supabase
        .from('store_products_import')
        .select('ItemCode, ItemName')
        .or(activeItems.map(item => `ItemName.ilike.%${item.name}%`).join(','));

      if (matchError) {
        console.error('Error finding item matches:', matchError);
        throw matchError;
      }

      if (!itemMatches?.length) {
        console.log('No matching products found');
        return [];
      }

      // Get unique ItemCodes
      const itemCodes = [...new Set(itemMatches.map(match => match.ItemCode))];
      console.log('Found ItemCodes:', itemCodes);

      // Get all store products with these ItemCodes
      const { data: products, error } = await supabase
        .from('store_products_import')
        .select('*')
        .in('ItemCode', itemCodes);

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      if (!products?.length) {
        console.log('No products found in database');
        return [];
      }

      console.log('Found products:', products);

      // Group products by store
      const productsByStore = products.reduce((acc, product) => {
        const storeKey = `${product.store_chain}-${product.store_id}`;
        if (!acc[storeKey]) {
          acc[storeKey] = {
            storeName: product.store_chain,
            storeId: product.store_id,
            products: []
          };
        }
        acc[storeKey].products.push(product);
        return acc;
      }, {} as Record<string, { storeName: string; storeId: string; products: typeof products }> );

      // Process each store's comparison
      const allStoreComparisons = Object.values(productsByStore).map(store => {
        const comparison = {
          storeName: store.storeName,
          storeId: store.storeId,
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

        // For each item in our list, find matching products by ItemCode
        comparison.items.forEach((item, index) => {
          // Find matching products for this item
          const itemMatches = itemMatches.filter(match => 
            match.ItemName.toLowerCase().includes(item.name.toLowerCase())
          );
          const matchingItemCodes = itemMatches.map(match => match.ItemCode);
          
          // Find all products in this store with matching ItemCodes
          const matchingProducts = store.products.filter(p => 
            matchingItemCodes.includes(p.ItemCode)
          );

          if (matchingProducts.length > 0) {
            // If we have multiple matches, use the cheapest one
            const cheapestProduct = matchingProducts.reduce((min, p) => 
              p.ItemPrice < min.ItemPrice ? p : min
            , matchingProducts[0]);

            comparison.items[index] = {
              ...item,
              price: cheapestProduct.ItemPrice,
              matchedProduct: cheapestProduct.ItemName,
              isAvailable: true
            };
            comparison.total += cheapestProduct.ItemPrice * item.quantity;
            comparison.availableItemsCount++;
          }
        });

        return comparison;
      });

      // Include all stores that have at least one item available
      const storesWithItems = allStoreComparisons.filter(store => 
        store.availableItemsCount > 0
      );

      // Sort by total price
      const sortedComparisons = storesWithItems.sort((a, b) => a.total - b.total);

      console.log('Final sorted comparisons:', sortedComparisons);
      
      return sortedComparisons;
    },
    enabled: items.length > 0,
    refetchInterval: 60000, // Refresh every minute
    retry: 3,
    staleTime: 30000,
  });
};