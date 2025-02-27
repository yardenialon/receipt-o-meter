
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ShoppingListItem, StoreComparison } from '@/types/shopping';
import { groupProductsByStore, processStoreComparisons } from '@/utils/shopping/productUtils';

export const useShoppingListPrices = (items: ShoppingListItem[] = []) => {
  return useQuery({
    queryKey: ['shopping-list-prices', items.map(i => `${i.name}-${i.quantity || 1}-${i.product_code || ''}`).join(',')],
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
          console.log('Found exact product matches:', exactMatches.length);
        }
      }
      
      // חיפוש לפי שם מוצר עבור פריטים ללא קוד מוצר - נשפר את החיפוש להיות רחב יותר
      if (itemsWithoutProductCode.length > 0) {
        // יצירת תנאי חיפוש עבור כל הפריטים
        const searchTerms = itemsWithoutProductCode.map(item => {
          // פירוק שם המוצר למילים משמעותיות (מעל 2 תווים)
          const words = item.name.split(' ').filter(word => word.length > 2);
          
          // יצירת תנאי חיפוש עבור כל מילה משמעותית
          const wordConditions = words
            .map(word => `product_name.ilike.%${word}%`)
            .join(',');
          
          return `(${wordConditions})`;
        }).join(',');
        
        const { data: nameMatches, error: nameMatchError } = await supabase
          .from('store_products')
          .select('product_code, product_name')
          .or(searchTerms);
          
        if (nameMatchError) {
          console.error('Error finding name matches:', nameMatchError);
        } else if (nameMatches) {
          console.log('Found name-based product matches:', nameMatches.length);
          
          // סינון כפילויות
          const existingCodes = new Set(productMatches.map(match => match.product_code));
          const uniqueNameMatches = nameMatches.filter(match => !existingCodes.has(match.product_code));
          
          productMatches = [...productMatches, ...uniqueNameMatches];
        }
      }

      if (!productMatches.length) {
        console.log('No matching products found');
        return [];
      }

      const productCodes = [...new Set(productMatches.map(match => match.product_code))];
      console.log('Found product codes for lookup:', productCodes.length);

      // נגדיל את מספר תוצאות הערפול כדי לקבל יותר מוצרים מהדאטאבייס
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

      console.log('Found products with prices:', products.length);

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
