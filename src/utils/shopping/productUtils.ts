
import { Product, ShoppingListItem, StoreComparison } from '@/types/shopping';

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

const findExactProductMatch = (
  products: Product[] | undefined,
  productCode: string
): Product | undefined => {
  if (!products) return undefined;
  return products.find(p => p.product_code === productCode);
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

      // חיפוש לפי קוד מוצר
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
          קודמוצר: item.product_code,
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
