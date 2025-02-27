
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ShoppingListItem, StoreComparison } from '@/types/shopping';
import { groupProductsByStore, processStoreComparisons, normalizeChainName } from '@/utils/shopping/productUtils';

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
      const productCodes = itemsWithProductCode.map(item => item.product_code).filter(Boolean) as string[];
      
      // שליפת מוצרים לפי שם (עבור מוצרים ללא קוד)
      const itemsWithoutProductCode = activeItems.filter(item => !item.product_code);
      const nameSearchTerms = itemsWithoutProductCode.map(item => item.name.toLowerCase().trim());
      
      // נכין תנאי חיפוש לפי שם מוצר
      const nameSearchConditions = nameSearchTerms.length > 0 
        ? nameSearchTerms.map(term => `product_name.ilike.%${term}%`).join(',')
        : '';

      let products = [];
      
      // אם יש לנו מוצרים עם קודי מוצר, נשלוף אותם
      if (productCodes.length > 0) {
        console.log('Searching for products with codes:', productCodes);
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
          console.log(`Found ${productsByCode.length} products by code:`, productsByCode.map(p => `${p.product_name} (${p.store_chain})`));
          products = productsByCode;
        }
      }

      // אם יש לנו מוצרים ללא קוד מוצר, נשלוף אותם לפי שם
      if (nameSearchTerms.length > 0) {
        // נפצל את החיפוש לכמה בקשות כדי להגדיל את הסיכוי למצוא התאמות
        const nameProducts = [];
        
        for (const searchTerm of nameSearchTerms) {
          console.log(`Searching for products with name containing: "${searchTerm}"`);
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
            .ilike('product_name', `%${searchTerm}%`)
            .limit(100); // מגביל כדי לא להחזיר יותר מדי תוצאות
          
          if (nameError) {
            console.error(`Error fetching products for term "${searchTerm}":`, nameError);
          } else if (productsByName && productsByName.length > 0) {
            const storeChains = [...new Set(productsByName.map(p => p.store_chain))];
            console.log(`Found ${productsByName.length} products for term "${searchTerm}" in chains:`, storeChains);
            nameProducts.push(...productsByName);
          } else {
            console.log(`No products found for term "${searchTerm}"`);
          }
        }
        
        if (nameProducts.length > 0) {
          // נסיר כפילויות
          const existingCodes = new Set(products.map(p => `${p.product_code}-${p.store_chain}`));
          const uniqueProductsByName = nameProducts.filter(p => !existingCodes.has(`${p.product_code}-${p.store_chain}`));
          
          products = [...products, ...uniqueProductsByName];
          console.log(`Added ${uniqueProductsByName.length} unique products by name search`);
        }
      }

      if (!products.length) {
        console.log('No matching products found');
        return [];
      }

      // לוג של כל המוצרים לפי רשת כדי לראות מה נמצא
      const storeChains = [...new Set(products.map(p => normalizeChainName(p.store_chain || '')))];
      console.log('Found products in these chains:', storeChains);
      storeChains.forEach(chain => {
        const chainProducts = products.filter(p => normalizeChainName(p.store_chain || '') === chain);
        console.log(`Chain ${chain}: ${chainProducts.length} products`);
      });

      // נשלח את המוצרים לעיבוד
      const productsByStore = groupProductsByStore(products);
      console.log('Products grouped by store:', Object.keys(productsByStore));
      
      const storesWithItems = processStoreComparisons(
        productsByStore,
        activeItems,
        products
      );

      console.log('Final stores with items:', storesWithItems.length, storesWithItems.map(s => s.storeName));
      
      return storesWithItems;
    },
    enabled: items.length > 0,
    refetchInterval: false, // שינוי ל-false כדי למנוע טעינה אוטומטית מחדש
    retry: 1, // מנסה רק פעם אחת נוספת במקרה של שגיאה
    staleTime: 5 * 60 * 1000, // 5 דקות - כך שהמידע יישאר תקף זמן סביר
  });
};
