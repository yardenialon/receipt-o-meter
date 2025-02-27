
import { Product, ShoppingListItem, StoreComparison } from '@/types/shopping';

export const groupProductsByStore = (products: Product[]): Record<string, StoreComparison> => {
  return products.reduce<Record<string, StoreComparison>>((acc, product) => {
    if (!product.price) return acc; // נתעלם ממוצרים ללא מחיר
    
    // קביעת פרטי החנות - נשתמש בשדה branch_mappings אם קיים, אחרת בשדות ישירים
    const storeChain = product.branch_mappings?.source_chain || product.store_chain;
    const storeId = product.branch_mappings?.source_branch_id || product.store_id;
    const branchName = product.branch_mappings?.source_branch_name || null;
    
    // חובה שיהיה לנו chain ו-ID כדי לזהות חנות ייחודית
    if (!storeChain || !storeId) {
      console.log('Missing store info for product:', product.product_name);
      return acc;
    }
    
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

// פונקציה משופרת לחיפוש מוצר מתאים
const findBestProductMatch = (
  products: Product[] | undefined,
  itemName: string,
  productCode?: string | null
): Product | undefined => {
  if (!products || !products.length) return undefined;
  
  // אם יש לנו קוד מוצר, נחפש התאמה מדויקת
  if (productCode) {
    const exactCodeMatch = products.find(p => p.product_code === productCode);
    if (exactCodeMatch) {
      console.log(`Found exact match by product code for ${itemName}:`, exactCodeMatch);
      return exactCodeMatch;
    }
  }
  
  // אחרת, נחפש לפי שם מוצר
  // התאמה מלאה (אחד מכיל את השני)
  const nameMatches = products.filter(p => {
    const productNameLower = p.product_name.toLowerCase();
    const itemNameLower = itemName.toLowerCase();
    
    return productNameLower.includes(itemNameLower) || 
           itemNameLower.includes(productNameLower);
  });
  
  if (nameMatches.length > 0) {
    // מיון התוצאות - העדפה למחיר נמוך יותר עבור התוצאה הראשונה
    nameMatches.sort((a, b) => a.price - b.price);
    console.log(`Found exact name match for ${itemName}:`, nameMatches[0]);
    return nameMatches[0];
  }
  
  // התאמה חלקית (מילים משותפות)
  const partialMatches = products.filter(p => {
    const productWords = p.product_name.toLowerCase().split(/\s+/);
    const itemWords = itemName.toLowerCase().split(/\s+/);
    
    return productWords.some(word => 
      word.length > 2 && itemWords.includes(word)
    ) || itemWords.some(word => 
      word.length > 2 && productWords.includes(word)
    );
  });
  
  if (partialMatches.length > 0) {
    // מיון תוצאות לפי מחיר
    partialMatches.sort((a, b) => a.price - b.price);
    console.log(`Found partial word match for ${itemName}:`, partialMatches[0]);
    return partialMatches[0];
  }
  
  return undefined;
};

export const processStoreComparisons = (
  productsByStore: Record<string, StoreComparison>,
  activeItems: ShoppingListItem[],
  productMatches: Product[]
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
      const matchingProduct = findBestProductMatch(
        store.products,
        item.name,
        item.product_code
      );

      if (matchingProduct) {
        console.log(`נמצא מוצר מתאים בחנות ${store.storeName}: ${matchingProduct.product_name} במחיר ${matchingProduct.price} ש"ח`);
        
        comparison.items[index] = {
          ...item,
          price: matchingProduct.price,
          matchedProduct: matchingProduct.product_name,
          isAvailable: true,
          product_code: matchingProduct.product_code
        };
        comparison.availableItemsCount++;
      } else {
        console.log(`לא נמצאה התאמה בחנות ${store.storeName}:`, {
          שםפריט: item.name,
          קודמוצר: item.product_code
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
