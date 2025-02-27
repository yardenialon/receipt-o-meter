
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
          console.log(`Found ${productsByCode.length} products by code`);
          
          // בדיקה מיוחדת - נבדוק שיש התאמות בכל הרשתות
          const chains = new Set(productsByCode.map(product => product.store_chain));
          console.log('Chains found for product codes:', [...chains]);
          
          // בדיקת מחירים עבור כל קוד מוצר בכל רשת
          productCodes.forEach(code => {
            const productsWithCode = productsByCode.filter(p => p.product_code === code);
            if (productsWithCode.length > 0) {
              console.log(`Product ${code} found in ${productsWithCode.length} stores:`);
              const productsByChain = productsWithCode.reduce((acc, p) => {
                if (!acc[p.store_chain]) acc[p.store_chain] = [];
                acc[p.store_chain].push(p);
                return acc;
              }, {} as Record<string, any[]>);
              
              Object.entries(productsByChain).forEach(([chain, prods]) => {
                console.log(`  ${chain}: ${prods.length} products, prices: ${prods.map(p => p.price).join(', ')}`);
              });
            }
          });
          
          products = productsByCode;
        }
      }

      // שינוי משמעותי: עבור כל מוצר ללא קוד, נבצע חיפוש נפרד וגם נעלה את הלימיט
      if (nameSearchTerms.length > 0) {
        const nameProducts = [];
        
        for (const searchTerm of nameSearchTerms) {
          console.log(`Searching for products with name containing: "${searchTerm}"`);
          
          // נבצע חיפוש בכל הרשתות
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
            .limit(500); // הגדלנו את הלימיט משמעותית
          
          if (nameError) {
            console.error(`Error fetching products for term "${searchTerm}":`, nameError);
          } else if (productsByName && productsByName.length > 0) {
            // בדוק בכמה רשתות שונות נמצאו מוצרים
            const storeChains = [...new Set(productsByName.map(p => p.store_chain))];
            console.log(`Found ${productsByName.length} products for term "${searchTerm}" in chains:`, storeChains);
            
            // בדיקת מחירים עבור כל מוצר בכל רשת
            const productsByChain = productsByName.reduce((acc, p) => {
              if (!acc[p.store_chain]) acc[p.store_chain] = [];
              acc[p.store_chain].push(p);
              return acc;
            }, {} as Record<string, any[]>);
            
            Object.entries(productsByChain).forEach(([chain, prods]) => {
              console.log(`  ${chain}: ${prods.length} products, example prices: ${prods.slice(0, 3).map(p => p.price).join(', ')}...`);
            });
            
            nameProducts.push(...productsByName);
          } else {
            // ניסיון נוסף עם חיפוש יותר כללי - אולי נמצא משהו
            const words = searchTerm.split(/\s+/).filter(word => word.length > 3);
            for (const word of words) {
              const { data: productsByWord, error: wordError } = await supabase
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
                .ilike('product_name', `%${word}%`)
                .limit(300);
              
              if (!wordError && productsByWord && productsByWord.length > 0) {
                console.log(`Found ${productsByWord.length} products for word "${word}"`);
                nameProducts.push(...productsByWord);
              }
            }
            
            console.log(`No products found for term "${searchTerm}"`);
          }
        }
        
        if (nameProducts.length > 0) {
          // דיבוג: בדוק אילו רשתות קיימות עבור מוצרים שנמצאו לפי שם
          const nameChains = new Set(nameProducts.map(product => product.store_chain));
          console.log('Chains found for name search:', [...nameChains]);
          
          // הסרת כפילויות
          const existingProductsMap = new Map(
            products.map(product => [`${product.product_code}-${product.store_chain}-${product.store_id}`, product])
          );
          
          for (const product of nameProducts) {
            const key = `${product.product_code}-${product.store_chain}-${product.store_id}`;
            if (!existingProductsMap.has(key)) {
              existingProductsMap.set(key, product);
            }
          }
          
          products = Array.from(existingProductsMap.values());
          console.log(`Total combined unique products: ${products.length}`);
        }
      }

      if (!products.length) {
        console.log('No matching products found');
        return [];
      }

      // לוג של כל המוצרים לפי רשת כדי לראות מה נמצא
      const storeChains = [...new Set(products.map(product => normalizeChainName(product.store_chain || '')))];
      console.log('Found products in these chains:', storeChains);
      
      // דיבוג: מראה כמה מוצרים יש בכל רשת
      storeChains.forEach(chain => {
        const chainProducts = products.filter(product => normalizeChainName(product.store_chain || '') === chain);
        console.log(`Chain ${chain}: ${chainProducts.length} products`);
        
        // בדיקת הטווח של מחירים
        if (chainProducts.length > 0) {
          const prices = chainProducts.map(p => p.price).filter(Boolean).sort((a, b) => a - b);
          if (prices.length > 0) {
            console.log(`  Price range for ${chain}: ${prices[0]} - ${prices[prices.length - 1]}`);
          }
        }
      });

      // נשלח את המוצרים לעיבוד
      const productsByStore = groupProductsByStore(products);
      console.log('Products grouped by store:', Object.keys(productsByStore));
      
      const storesWithItems = processStoreComparisons(
        productsByStore,
        activeItems,
        products
      );

      console.log('Final stores with items:', storesWithItems.length, storesWithItems.map(s => 
        `${s.storeName} (${s.availableItemsCount}/${s.items.length}, total: ${s.total})`
      ));
      
      return storesWithItems;
    },
    enabled: items.length > 0,
    refetchInterval: false,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};
