
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

      // שליפת מוצרים לפי קודי מוצר (אם קיימים)
      const itemsWithProductCode = activeItems.filter(item => item.product_code);
      const productCodes = itemsWithProductCode.map(item => item.product_code).filter(Boolean);
      
      // שליפת מוצרים לפי שם (עבור מוצרים ללא קוד)
      const itemsWithoutProductCode = activeItems.filter(item => !item.product_code);
      const nameSearchConditions = itemsWithoutProductCode
        .map(item => `product_name.ilike.%${item.name}%`)
        .join(',');

      let products = [];
      
      // אם יש לנו מוצרים עם קודי מוצר, נשלוף אותם
      if (productCodes.length > 0) {
        const { data: productsByCode, error: codeError } = await supabase
          .from('store_products')
          .select(`
            product_code,
            product_name,
            price,
            store_chain,
            store_id,
            branch_mapping_id,
            branch_mappings (
              source_chain,
              source_branch_id,
              source_branch_name
            )
          `)
          .in('product_code', productCodes);

        if (codeError) {
          console.error('Error fetching products by code:', codeError);
        } else if (productsByCode && productsByCode.length > 0) {
          console.log(`Found ${productsByCode.length} products by code`);
          products = productsByCode;
        }
      }

      // אם יש לנו מוצרים ללא קוד מוצר, נשלוף אותם לפי שם
      if (itemsWithoutProductCode.length > 0) {
        const { data: productsByName, error: nameError } = await supabase
          .from('store_products')
          .select(`
            product_code,
            product_name,
            price,
            store_chain,
            store_id,
            branch_mapping_id,
            branch_mappings (
              source_chain,
              source_branch_id,
              source_branch_name
            )
          `)
          .or(nameSearchConditions);

        if (nameError) {
          console.error('Error fetching products by name:', nameError);
        } else if (productsByName && productsByName.length > 0) {
          console.log(`Found ${productsByName.length} products by name`);
          
          // נסיר כפילויות
          const existingCodes = new Set(products.map(p => p.product_code));
          const uniqueProductsByName = productsByName.filter(p => !existingCodes.has(p.product_code));
          
          products = [...products, ...uniqueProductsByName];
        }
      }

      if (!products.length) {
        console.log('No matching products found');
        return [];
      }

      console.log('Found products with prices:', products.length);

      // נשלח את המוצרים לעיבוד
      const productsByStore = groupProductsByStore(products);
      const storesWithItems = processStoreComparisons(
        productsByStore,
        activeItems,
        products
      );

      // מיון החנויות: קודם אלו עם כל המוצרים, ואז לפי מחיר
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
