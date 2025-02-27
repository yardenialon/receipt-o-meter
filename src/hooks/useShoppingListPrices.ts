
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ShoppingListItem, StoreComparison } from '@/types/shopping';
import { groupProductsByStore, processStoreComparisons } from '@/utils/shopping/productUtils';

export const useShoppingListPrices = (items: ShoppingListItem[] = []) => {
  return useQuery({
    queryKey: ['shopping-list-prices', items.map(i => `${i.name}-${i.quantity || 1}`).join(',')],
    queryFn: async () => {
      if (!items.length) return [];

      const activeItems = items.filter(item => !item.is_completed);
      if (!activeItems.length) return [];

      console.log('Active items to compare:', activeItems);

      // קודם חפש התאמות מדויקות לפי קוד מוצר אם קיים
      const itemsWithProductCode = activeItems.filter(item => item.product_code);
      const itemsWithoutProductCode = activeItems.filter(item => !item.product_code);
      
      let productMatches = [];
      
      // חיפוש לפי קוד מוצר
      if (itemsWithProductCode.length > 0) {
        const { data: exactMatches, error: exactMatchError } = await supabase
          .from('store_products')
          .select('product_code, product_name')
          .in('product_code', itemsWithProductCode.map(item => item.product_code));
          
        if (exactMatchError) {
          console.error('Error finding exact matches:', exactMatchError);
        } else if (exactMatches) {
          productMatches = [...productMatches, ...exactMatches];
        }
      }
      
      // חיפוש לפי שם מוצר עבור פריטים ללא קוד מוצר
      if (itemsWithoutProductCode.length > 0) {
        const { data: nameMatches, error: nameMatchError } = await supabase
          .from('store_products')
          .select('product_code, product_name')
          .or(itemsWithoutProductCode.map(item => `product_name.ilike.%${item.name}%`).join(','));
          
        if (nameMatchError) {
          console.error('Error finding name matches:', nameMatchError);
        } else if (nameMatches) {
          productMatches = [...productMatches, ...nameMatches];
        }
      }

      if (!productMatches.length) {
        console.log('No matching products found');
        return [];
      }

      const productCodes = [...new Set(productMatches.map(match => match.product_code))];
      console.log('Found product codes:', productCodes);

      const { data: products, error } = await supabase
        .from('store_products')
        .select(`
          product_code,
          product_name,
          price,
          branch_mapping_id,
          store_chain,
          store_id,
          branch_mappings (
            source_chain,
            source_branch_id,
            source_branch_name
          )
        `)
        .in('product_code', productCodes);

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      if (!products?.length) {
        console.log('No products found in database');
        return [];
      }

      console.log('Found products with prices:', products);

      const productsByStore = groupProductsByStore(products);
      const storesWithItems = processStoreComparisons(
        productsByStore,
        activeItems,
        productMatches
      );

      const sortedComparisons = storesWithItems.sort((a, b) => {
        const aComplete = a.availableItemsCount === activeItems.length;
        const bComplete = b.availableItemsCount === activeItems.length;
        
        if (aComplete !== bComplete) {
          return bComplete ? 1 : -1;
        }
        
        return a.total - b.total;
      });

      console.log('Final sorted comparisons:', sortedComparisons);
      
      return sortedComparisons;
    },
    enabled: items.length > 0,
    refetchInterval: 60000,
    retry: 3,
    staleTime: 30000,
  });
};
