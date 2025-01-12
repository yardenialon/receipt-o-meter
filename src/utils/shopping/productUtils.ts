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
    .replace(/[^\w\s]/g, '');
};

const findExactProductMatch = (
  products: Product[] | undefined,
  productCode: string
): Product | undefined => {
  if (!products) return undefined;
  return products.find(p => p.product_code === productCode);
};

const findSimilarProducts = (
  products: Product[] | undefined,
  itemName: string
): Product[] => {
  if (!products) return [];
  
  const normalizedItemName = normalizeText(itemName);
  
  return products.filter(product => {
    const normalizedProductName = normalizeText(product.product_name);
    return normalizedProductName.includes(normalizedItemName) || 
           normalizedItemName.includes(normalizedProductName);
  });
};

export const processStoreComparisons = (
  productsByStore: Record<string, StoreComparison>,
  activeItems: ShoppingListItem[],
  productMatches: Array<{ product_code: string; product_name: string }>
): StoreComparison[] => {
  console.log('התחלת עיבוד השוואת מחירים:', {
    מספרחנויות: Object.keys(productsByStore).length,
    מספרפריטים: activeItems.length
  });

  return Object.values(productsByStore).map(store => {
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

    if (!store.products) {
      console.log(`אין מוצרים בחנות ${store.storeName}`);
      return comparison;
    }

    comparison.items.forEach((item, index) => {
      let matchingProduct: Product | undefined;

      // חיפוש לפי קוד מוצר אם קיים
      if (item.product_code) {
        matchingProduct = findExactProductMatch(store.products, item.product_code);
        if (matchingProduct) {
          console.log(`נמצאה התאמה מדויקת לפי קוד מוצר:`, {
            שםפריט: item.name,
            קודמוצר: item.product_code,
            שםחנות: store.storeName
          });
        }
      }

      // אם אין התאמה מדויקת, מנסים למצוא לפי שם
      if (!matchingProduct) {
        const similarProducts = findSimilarProducts(store.products, item.name);
        if (similarProducts.length > 0) {
          // בוחרים את המוצר הזול ביותר מבין ההתאמות
          matchingProduct = similarProducts.reduce((min, p) => 
            p.price < min.price ? p : min
          , similarProducts[0]);

          console.log(`נמצאה התאמה לפי שם:`, {
            שםפריט: item.name,
            שםמוצר: matchingProduct.product_name,
            מחיר: matchingProduct.price,
            שםחנות: store.storeName
          });
        }
      }

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
        console.log(`לא נמצאה התאמה:`, {
          שםפריט: item.name,
          שםחנות: store.storeName
        });
      }
    });

    // חישוב סך הכל עבור החנות
    comparison.total = comparison.items.reduce((sum, item) => {
      if (item.isAvailable && item.price !== null) {
        return sum + (item.price * item.quantity);
      }
      return sum;
    }, 0);

    console.log(`סיכום חנות ${store.storeName}:`, {
      סהכמחיר: comparison.total,
      מוצריםזמינים: comparison.availableItemsCount,
      סהכמוצרים: comparison.items.length
    });

    return comparison;
  });
};