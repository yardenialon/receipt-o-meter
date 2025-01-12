import { Product, ShoppingListItem, StoreComparison } from '@/types/shopping';

interface ProductMatchingItem {
  name: string;
  product_code?: string;
}

export const groupProductsByStore = (products: Product[]): Record<string, StoreComparison> => {
  return products.reduce<Record<string, StoreComparison>>((acc, product) => {
    if (!product.branch_mappings) return acc;

    const mapping = product.branch_mappings;
    const storeKey = `${mapping.source_chain}-${mapping.source_branch_id}`;

    if (!acc[storeKey]) {
      acc[storeKey] = {
        storeName: mapping.source_chain,
        storeId: mapping.source_branch_id,
        branchName: mapping.source_branch_name,
        branchAddress: null,
        items: [],
        total: 0,
        availableItemsCount: 0,
        products: []
      };
    }

    acc[storeKey].products = acc[storeKey].products || [];
    acc[storeKey].products.push(product);
    return acc;
  }, {});
};

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/[a-zA-Z]/g, '');
};

export const findMatchingProducts = (
  productMatches: Array<{ product_code: string; product_name: string }>,
  item: ProductMatchingItem
): Array<{ product_code: string; product_name: string }> => {
  // אם יש קוד מוצר, נחפש התאמה מדויקת
  if (item.product_code) {
    console.log('מחפש התאמה מדויקת לפי קוד מוצר:', item.product_code);
    const exactMatches = productMatches.filter(match => match.product_code === item.product_code);
    if (exactMatches.length > 0) {
      console.log('נמצאה התאמה מדויקת:', exactMatches);
      return exactMatches;
    }
  }

  // אם אין קוד מוצר או לא נמצאה התאמה, נחפש לפי שם
  const normalizedItemName = normalizeText(item.name);
  console.log('מחפש התאמות לפי שם:', {
    שםמקורי: item.name,
    שםמנורמל: normalizedItemName
  });

  const matches = productMatches.filter(match => {
    const normalizedProductName = normalizeText(match.product_name);
    
    // בדיקה אם השם המנורמל של המוצר מכיל את השם המנורמל של הפריט או להיפך
    const isMatch = normalizedProductName.includes(normalizedItemName) || 
                   normalizedItemName.includes(normalizedProductName);
    
    if (isMatch) {
      console.log('נמצאה התאמה:', {
        שםפריט: item.name,
        שםמוצר: match.product_name,
        קודמוצר: match.product_code
      });
    }
    
    return isMatch;
  });

  console.log(`נמצאו ${matches.length} התאמות עבור ${item.name}`);
  return matches;
};

export const processStoreComparisons = (
  productsByStore: Record<string, StoreComparison>,
  activeItems: ShoppingListItem[],
  productMatches: Array<{ product_code: string; product_name: string }>
): StoreComparison[] => {
  return Object.values(productsByStore).map(store => {
    console.log('מעבד מוצרי חנות:', {
      שםחנות: store.storeName,
      סהכמוצרים: store.products?.length || 0
    });

    const comparison: StoreComparison = {
      ...store,
      items: activeItems.map(item => ({
        name: item.name,
        price: null,
        matchedProduct: '',
        quantity: item.quantity || 1,
        isAvailable: false,
        product_code: item.product_code
      })),
      total: 0,
      availableItemsCount: 0
    };

    if (store.products) {
      comparison.items.forEach((item, index) => {
        // אם יש קוד מוצר, נחפש התאמה מדויקת בחנות הספציפית
        if (item.product_code) {
          const matchingProduct = store.products?.find(p => p.product_code === item.product_code);
          if (matchingProduct) {
            comparison.items[index] = {
              ...item,
              price: matchingProduct.price,
              matchedProduct: matchingProduct.product_name,
              isAvailable: true,
              product_code: matchingProduct.product_code
            };
            comparison.availableItemsCount++;
          } else {
            // אם לא נמצאה התאמה מדויקת, המוצר לא זמין בחנות זו
            comparison.items[index] = {
              ...item,
              isAvailable: false
            };
          }
        } else {
          // חיפוש לפי שם רק אם אין קוד מוצר
          const matchingProductCodes = findMatchingProducts(productMatches, { 
            name: item.name
          }).map(match => match.product_code);
          
          console.log('קודי מוצר תואמים שנמצאו בחנות:', {
            שםפריט: item.name,
            קודמוצר: item.product_code,
            שםחנות: store.storeName,
            קודים: matchingProductCodes
          });

          // חיפוש מוצרים תואמים בחנות הספציפית
          const matchingProducts = store.products?.filter(p => 
            matchingProductCodes.includes(p.product_code)
          );

          console.log('מוצרים תואמים בחנות:', {
            שםפריט: item.name,
            שםחנות: store.storeName,
            התאמות: matchingProducts?.length || 0
          });

          if (matchingProducts && matchingProducts.length > 0) {
            // בחירת המוצר הזול ביותר מבין ההתאמות
            const cheapestProduct = matchingProducts.reduce((min, p) => 
              p.price < min.price ? p : min
            , matchingProducts[0]);

            comparison.items[index] = {
              ...item,
              price: cheapestProduct.price,
              matchedProduct: cheapestProduct.product_name,
              isAvailable: true,
              product_code: cheapestProduct.product_code
            };
            comparison.availableItemsCount++;
          } else {
            // אם לא נמצאו התאמות, המוצר לא זמין
            comparison.items[index] = {
              ...item,
              isAvailable: false
            };
          }
        }
      });

      // חישוב סך הכל עבור החנות
      comparison.total = comparison.items.reduce((sum, item) => {
        if (item.isAvailable && item.price !== null) {
          return sum + (item.price * item.quantity);
        }
        return sum;
      }, 0);
    }

    return comparison;
  });
};