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

        // For each item in our list, try to find a matching product
        comparison.items.forEach((item, index) => {
          // Find exact matches by name first
          const exactMatches = store.products.filter(p => 
            p.ItemName.toLowerCase() === item.name.toLowerCase()
          );

          // If no exact match, look for products with same ItemCode
          let matchingProduct;
          if (exactMatches.length > 0) {
            matchingProduct = exactMatches[0];
          } else {
            // Try to find a product with matching ItemCode from any store
            const anyMatch = products.find(p => 
              p.ItemName.toLowerCase() === item.name.toLowerCase()
            );
            if (anyMatch) {
              matchingProduct = store.products.find(p => 
                p.ItemCode === anyMatch.ItemCode
              );
            }
          }

          if (matchingProduct) {
            comparison.items[index] = {
              ...item,
              price: matchingProduct.ItemPrice,
              matchedProduct: matchingProduct.ItemName,
              isAvailable: true
            };
            comparison.total += matchingProduct.ItemPrice * item.quantity;
            comparison.availableItemsCount++;
          }
        });

        return comparison;
      });

      // Sort comparisons first by total price (only for stores with all items available)
      const sortedComparisons = allStoreComparisons.sort((a, b) => {
        // If both stores have all items available, sort by total price
        if (a.availableItemsCount === activeItems.length && 
            b.availableItemsCount === activeItems.length) {
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
