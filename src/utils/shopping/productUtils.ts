
import { Product, ShoppingListItem, StoreComparison } from '@/types/shopping';

export const groupProductsByStore = (products: Product[]): Record<string, StoreComparison> => {
  return products.reduce<Record<string, StoreComparison>>((acc, product) => {
    // שימוש במידע מהמוצר עצמו או ממיפוי הסניף, אם קיים
    const storeChain = product.branch_mappings?.source_chain || product.store_chain;
    const storeId = product.branch_mappings?.source_branch_id || product.store_id;
    const branchName = product.branch_mappings?.source_branch_name || null;
    
    if (!storeChain || !storeId) return acc;
    
    const storeKey = `${storeChain}-${storeId}`;

    if (!acc[storeKey]) {
      acc[storeKey] = {
        storeName: storeChain,
        storeId: storeId,
        branchName: branchName,
        branchAddress: null,
        items: [],
        total: 0,
        availableItemsCount: 0,
        products: []
      };
    }

    acc[storeKey].products = acc[storeKey].products || [];
    acc[storeKey].products.push(product);
    
    console.log(`Adding product to store ${storeKey}:`, {
      product_code: product.product_code,
      product_name: product.product_name,
      price: product.price
    });
    
    return acc;
  }, {});
};

const findBestProductMatch = (
  products: Product[] | undefined,
  itemName: string,
  productCode?: string
): Product | undefined => {
  if (!products || !products.length) return undefined;
  
  // אם יש קוד מוצר, נחפש התאמה מדויקת
  if (productCode) {
    const exactMatch = products.find(p => p.product_code === productCode);
    if (exactMatch) {
      console.log(`Found exact match by product code for ${itemName}:`, exactMatch);
      return exactMatch;
    }
  }
  
  // אחרת, נחפש התאמה לפי שם
  const nameMatches = products.filter(p => 
    p.product_name.toLowerCase().includes(itemName.toLowerCase()) || 
    itemName.toLowerCase().includes(p.product_name.toLowerCase())
  );
  
  if (nameMatches.length > 0) {
    // מיון לפי התאמה הטובה ביותר
    nameMatches.sort((a, b) => {
      // העדפת מוצרים שהשם שלהם מכיל את השם המבוקש במלואו
      const aContains = a.product_name.toLowerCase().includes(itemName.toLowerCase());
      const bContains = b.product_name.toLowerCase().includes(itemName.toLowerCase());
      
      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;
      
      // אם שניהם מכילים, נעדיף את המוצר עם השם הקצר יותר (בהנחה שהוא יותר ספציפי)
      return a.product_name.length - b.product_name.length;
    });
    
    console.log(`Found name match for ${itemName}:`, nameMatches[0]);
    return nameMatches[0];
  }
  
  return undefined;
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
    console.log(`עיבוד חנות ${store.storeName} (${store.storeId})`, {
      מספרמוצרים: store.products?.length || 0
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

    // וודא שקיימים מוצרים בחנות
    if (!store.products || store.products.length === 0) {
      console.log(`אין מוצרים בחנות ${store.storeName}`);
      return comparison;
    }

    // עבור כל פריט ברשימה, מצא את המוצר המתאים בחנות
    comparison.items.forEach((item, index) => {
      // חיפוש המוצר המתאים ביותר
      const matchingProduct = findBestProductMatch(
        store.products,
        item.name,
        item.product_code
      );

      if (matchingProduct) {
        console.log(`נמצא מוצר מתאים: ${matchingProduct.product_name} במחיר ${matchingProduct.price} ש"ח`);
        
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
        const itemTotal = item.price * item.quantity;
        console.log(`חישוב מחיר עבור ${item.name}: ${item.price} * ${item.quantity} = ${itemTotal}`);
        return sum + itemTotal;
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
