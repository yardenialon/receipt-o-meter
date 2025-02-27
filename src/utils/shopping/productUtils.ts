
import { Product, ShoppingListItem, StoreComparison } from '@/types/shopping';

// פונקציה לנרמול שם רשת
export const normalizeChainName = (storeName: string): string => {
  const normalizedName = storeName.toLowerCase().trim();
  
  const yochananofVariations = [
    'yochananof', 'יוחננוף', 'יוחנונוף', 'יוחננוב',
    'יוחננוף טוב טעם', 'יוחננוף טוב טעם בעמ', 'טוב טעם יוחננוף',
    'טוב טעם', 'tov taam', 'tovtaam', 'טוב טעם בעמ', 'טוב טעם רשת'
  ];

  const ramiLevyVariations = [
    'רמי לוי', 'rami levy', 'רמי לוי שיווק השקמה',
    'שיווק השקמה', 'רמי לוי שיווק השיקמה', 'רמי לוי סניף'
  ];

  const shufersalVariations = [
    'שופרסל', 'shufersal', 'שופרסל אונליין',
    'שופרסל דיל', 'שופרסל שלי', 'שופרסל אקספרס'
  ];

  if (yochananofVariations.some(variant => normalizedName.includes(variant.toLowerCase()))) {
    return 'יוחננוף';
  } else if (ramiLevyVariations.some(variant => normalizedName.includes(variant.toLowerCase()))) {
    return 'רמי לוי';
  } else if (shufersalVariations.some(variant => normalizedName.includes(variant.toLowerCase()))) {
    return 'שופרסל';
  }

  return storeName;
};

export const groupProductsByStore = (products: Product[]): Record<string, StoreComparison> => {
  // Step 1: First, group all products by chain (not by store)
  const chainGroups = new Map<string, Product[]>();
  
  products.forEach(product => {
    if (!product.price) return; // נתעלם ממוצרים ללא מחיר
    
    // קביעת פרטי החנות - נשתמש בשדה branch_mappings אם קיים, אחרת בשדות ישירים
    const sourceChain = product.branch_mappings?.source_chain || product.store_chain;
    
    if (!sourceChain) {
      console.log('Missing store chain for product:', product.product_name);
      return;
    }
    
    // נרמול שם הרשת
    const normalizedChain = normalizeChainName(sourceChain);
    
    if (!chainGroups.has(normalizedChain)) {
      chainGroups.set(normalizedChain, []);
    }
    
    chainGroups.get(normalizedChain)?.push({
      ...product,
      store_chain: normalizedChain // עדכון שם הרשת המנורמל
    });
  });
  
  console.log('Grouped products by chain:', Array.from(chainGroups.keys()));
  
  // Step 2: Create a StoreComparison for each chain
  const result: Record<string, StoreComparison> = {};
  
  chainGroups.forEach((chainProducts, chainName) => {
    // שליפת הסניף הראשון לצורך מידע על החנות
    const firstProduct = chainProducts[0];
    const storeId = firstProduct.branch_mappings?.source_branch_id || firstProduct.store_id;
    const branchName = firstProduct.branch_mappings?.source_branch_name || null;
    
    // יצירת מזהה ייחודי לרשת
    const chainKey = chainName;
    
    result[chainKey] = {
      storeName: chainName,
      storeId: storeId,
      branchName: branchName,
      branchAddress: null,
      items: [],
      total: 0,
      availableItemsCount: 0,
      products: chainProducts, // כל המוצרים של אותה רשת
      branches: {} // נאחסן כאן מידע על כל הסניפים
    };
    
    // איסוף מידע על כל הסניפים של הרשת
    const branchesMap = new Map<string, Set<string>>();
    chainProducts.forEach(product => {
      const branchId = product.branch_mappings?.source_branch_id || product.store_id;
      if (branchId) {
        if (!branchesMap.has(chainName)) {
          branchesMap.set(chainName, new Set());
        }
        branchesMap.get(chainName)?.add(branchId);
      }
    });
    
    // הוספת הסניפים למידע על הרשת
    result[chainKey].branches = Array.from(branchesMap.entries()).reduce((acc, [chain, branches]) => {
      acc[chain] = Array.from(branches);
      return acc;
    }, {} as Record<string, string[]>);
    
    console.log(`Added chain ${chainName} with ${chainProducts.length} products`);
  });
  
  return result;
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
    console.log(`עיבוד רשת ${store.storeName}`, {
      מספרמוצרים: store.products?.length || 0,
      סניפים: Object.keys(store.branches || {}).length
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
      console.log(`אין מוצרים ברשת ${store.storeName}`);
      return comparison;
    }

    // עבור כל פריט ברשימה, מצא את המוצר הזול ביותר ברשת
    comparison.items.forEach((item, index) => {
      // חפש רק מוצרים עם אותו קוד מוצר אם יש קוד מוצר
      let relevantProducts = store.products;
      
      if (item.product_code) {
        relevantProducts = store.products.filter(p => p.product_code === item.product_code);
      }
      
      // מצא את המוצר הזול ביותר מבין ההתאמות
      const matchingProduct = findBestProductMatch(
        relevantProducts,
        item.name,
        item.product_code
      );

      if (matchingProduct) {
        console.log(`נמצא מוצר מתאים ברשת ${store.storeName}: ${matchingProduct.product_name} במחיר ${matchingProduct.price} ש"ח`);
        
        comparison.items[index] = {
          ...item,
          price: matchingProduct.price,
          matchedProduct: matchingProduct.product_name,
          isAvailable: true,
          product_code: matchingProduct.product_code,
          store_id: matchingProduct.store_id, // שמירת מזהה הסניף
          store_chain: matchingProduct.store_chain // שמירת שם הרשת
        };
        comparison.availableItemsCount++;
      } else {
        console.log(`לא נמצאה התאמה ברשת ${store.storeName}:`, {
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

    console.log(`סיכום רשת ${store.storeName}:`, {
      סהכמחיר: comparison.total,
      מוצריםזמינים: comparison.availableItemsCount,
      סהכמוצרים: comparison.items.length
    });

    return comparison;
  });
};
