
import { Product, ShoppingListItem, StoreComparison } from '@/types/shopping';

// פונקציה לנרמול שם רשת
export const normalizeChainName = (storeName: string): string => {
  if (!storeName) return '';
  
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

// פונקציה משופרת לקיבוץ מוצרים לפי רשת
export const groupProductsByStore = (products: Product[]): Record<string, StoreComparison> => {
  console.log('Starting to group products by store. Total products:', products.length);
  
  // קודם נקבץ לפי רשת
  const chainGroups = new Map<string, Product[]>();
  
  // שלב 1: מיפוי ראשוני לפי store_chain
  products.forEach(product => {
    if (!product.price) {
      console.log('Skipping product without price:', product.product_name);
      return;
    }
    
    // השתמש ב-store_chain ישירות ראשית - זה המידע הכי בסיסי ומהימן
    const chainName = product.store_chain ? normalizeChainName(product.store_chain) : '';
    
    if (!chainName) {
      console.log('Missing store chain for product:', product.product_name);
      return;
    }
    
    if (!chainGroups.has(chainName)) {
      chainGroups.set(chainName, []);
    }
    
    chainGroups.get(chainName)?.push({
      ...product,
      store_chain: chainName // עדכון שם הרשת המנורמל
    });
  });
  
  console.log('Grouped products by chain:', Array.from(chainGroups.keys()));
  
  // שלב 2: יצירת השוואה לכל רשת
  const result: Record<string, StoreComparison> = {};
  
  chainGroups.forEach((chainProducts, chainName) => {
    if (chainProducts.length === 0) {
      console.log(`Chain ${chainName} has no products, skipping`);
      return;
    }
    
    // מציאת הסניף הראשון לצורך מידע
    // נשים לב: כאן אנחנו לא מחליפים את הרשת אלא רק מחפשים מידע על הסניף
    const firstProduct = chainProducts[0];
    let storeId = firstProduct.store_id || null;
    let branchName = null;
    
    // אם יש מיפוי סניפים, נשתמש בו כמידע נוסף
    if (firstProduct.branch_mappings) {
      storeId = firstProduct.branch_mappings.source_branch_id || storeId;
      branchName = firstProduct.branch_mappings.source_branch_name || branchName;
    }
    
    // יצירת מזהה ייחודי לרשת - פשוט שם הרשת המנורמל
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
    
    console.log(`Added chain ${chainName} with ${chainProducts.length} products and ${Object.values(result[chainKey].branches || {}).flat().length} branches`);
  });
  
  return result;
};

// פונקציה משופרת לחיפוש מוצרים מתאימים - החזרת מערך של כל המוצרים המתאימים
const findMatchingProducts = (
  products: Product[] | undefined,
  itemName: string,
  productCode?: string | null
): Product[] => {
  if (!products || !products.length) return [];
  
  // אם יש לנו קוד מוצר, נחפש התאמה מדויקת
  if (productCode) {
    const exactCodeMatches = products.filter(p => p.product_code === productCode);
    if (exactCodeMatches.length > 0) {
      console.log(`Found ${exactCodeMatches.length} exact matches by product code for ${itemName}`);
      // מיון לפי מחיר נמוך תחילה
      return exactCodeMatches.sort((a, b) => a.price - b.price);
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
    // מיון התוצאות - העדפה למחיר נמוך יותר
    console.log(`Found ${nameMatches.length} name matches for ${itemName}`);
    return nameMatches.sort((a, b) => a.price - b.price);
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
    console.log(`Found ${partialMatches.length} partial word matches for ${itemName}`);
    return partialMatches.sort((a, b) => a.price - b.price);
  }
  
  return [];
};

export const processStoreComparisons = (
  productsByStore: Record<string, StoreComparison>,
  activeItems: ShoppingListItem[],
  productMatches: Product[]
): StoreComparison[] => {
  console.log('Starting to process store comparisons');
  console.log('Number of stores:', Object.keys(productsByStore).length);
  console.log('Number of active items:', activeItems.length);

  // קריטי: וודא שלכל רשת יש רשומה
  const allChains = new Set<string>();
  productMatches.forEach(product => {
    if (product.store_chain) {
      const chainName = normalizeChainName(product.store_chain);
      if (chainName) allChains.add(chainName);
    }
  });
  
  console.log('All chains found in products:', Array.from(allChains));

  // חשוב מאוד: וודא שיש לנו רשומה לכל רשת שמופיעה במוצרים
  allChains.forEach(chainName => {
    if (!productsByStore[chainName]) {
      console.log(`Creating missing record for chain: ${chainName}`);
      
      // חיפוש מוצרים עבור הרשת הזו
      const chainProducts = productMatches.filter(product => 
        normalizeChainName(product.store_chain || '') === chainName
      );
      
      if (chainProducts.length > 0) {
        const firstProduct = chainProducts[0];
        const storeId = firstProduct.branch_mappings?.source_branch_id || firstProduct.store_id;
        
        productsByStore[chainName] = {
          storeName: chainName,
          storeId: storeId || null,
          branchName: null,
          branchAddress: null,
          items: [],
          total: 0,
          availableItemsCount: 0,
          products: chainProducts
        };
        
        console.log(`Created new store comparison for ${chainName} with ${chainProducts.length} products`);
      }
    }
  });

  // עיבוד ההשוואות עבור כל חנות
  const comparisons = Object.values(productsByStore).map(store => {
    console.log(`Processing chain ${store.storeName}`);
    console.log('Number of products:', store.products?.length || 0);

    const comparison: StoreComparison = {
      ...store,
      items: activeItems.map(item => ({
        name: item.name,
        price: null,
        matchedProduct: '',
        quantity: item.quantity || 1,
        isAvailable: false,
        product_code: item.product_code,
        matchedProducts: [] // אתחול מערך המוצרים המתאימים
      })),
      total: 0,
      availableItemsCount: 0
    };

    // וודא שקיימים מוצרים בחנות
    if (!store.products || store.products.length === 0) {
      console.log(`No products found for chain ${store.storeName}`);
      return comparison;
    }

    // עבור כל פריט ברשימה, מצא את כל המוצרים המתאימים ברשת
    comparison.items.forEach((item, index) => {
      // חפש מוצרים מתאימים
      const matchingProducts = findMatchingProducts(
        store.products,
        item.name,
        item.product_code
      );

      if (matchingProducts.length > 0) {
        console.log(`Found ${matchingProducts.length} matching products for ${item.name} in chain ${store.storeName}`);
        
        // שמור את המוצר הזול ביותר כמוצר הראשי
        const cheapestProduct = matchingProducts[0];
        
        comparison.items[index] = {
          ...item,
          price: cheapestProduct.price,
          matchedProduct: cheapestProduct.product_name,
          isAvailable: true,
          product_code: cheapestProduct.product_code,
          store_id: cheapestProduct.store_id,
          store_chain: cheapestProduct.store_chain,
          matchedProducts: matchingProducts // שמור את כל המוצרים המתאימים
        };
        comparison.availableItemsCount++;
      } else {
        console.log(`No match found for ${item.name} in chain ${store.storeName}`);
      }
    });

    // חישוב סך הכל עבור החנות - רק עבור פריטים זמינים
    comparison.total = comparison.items.reduce((sum, item) => {
      if (item.isAvailable && item.price !== null) {
        const itemTotal = item.price * item.quantity;
        console.log(`Item price calculation: ${item.name} - ${item.price} * ${item.quantity} = ${itemTotal}`);
        return sum + itemTotal;
      }
      return sum;
    }, 0);

    console.log(`Chain ${store.storeName} summary:`, {
      total: comparison.total,
      availableItems: comparison.availableItemsCount,
      totalItems: comparison.items.length
    });

    return comparison;
  });
  
  // לא נסנן חנויות כלל, נחזיר את כולן גם אם אין להן פריטים זמינים
  const filteredComparisons = comparisons;
  
  console.log('All comparisons (no filtering):', filteredComparisons.map(c => c.storeName));
  
  // מיון: קודם כל חנויות עם יותר פריטים זמינים, ואז לפי מחיר
  const sortedComparisons = filteredComparisons.sort((a, b) => {
    // קודם כל סדר לפי כמות פריטים זמינים (מהגבוה לנמוך)
    if (a.availableItemsCount !== b.availableItemsCount) {
      return b.availableItemsCount - a.availableItemsCount;
    }
    
    // אם יש אותה כמות פריטים, סדר לפי מחיר כולל (מהנמוך לגבוה)
    return a.total - b.total;
  });

  console.log('Final sorted comparisons:', sortedComparisons.map(c => ({
    store: c.storeName,
    availableItems: c.availableItemsCount,
    total: c.total
  })));
  
  return sortedComparisons;
};
