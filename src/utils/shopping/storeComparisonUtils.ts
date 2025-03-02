
import { Product, ShoppingListItem, StoreComparison } from '@/types/shopping';
import { normalizeChainName } from './storeNameUtils';
import { findMatchingProducts } from './productMatchingUtils';

export const processStoreComparisons = (
  productsByStore: Record<string, StoreComparison>,
  activeItems: ShoppingListItem[],
  allProducts: Product[]
): StoreComparison[] => {
  console.log('Starting to process store comparisons');
  console.log('Number of stores:', Object.keys(productsByStore).length);
  console.log('Number of active items:', activeItems.length);

  // קריטי: וודא שיש לנו רישום של כל הרשתות
  const allChains = new Set<string>();
  allProducts.forEach(product => {
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
      const chainProducts = allProducts.filter(product => 
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

    // וודא שקיימים מוצרים בחנות זו
    if (!store.products || store.products.length === 0) {
      console.log(`No products found for chain ${store.storeName}`);
      return comparison;
    }

    // עבור כל פריט ברשימה, נחפש התאמות בכל הרשתות
    const matchesByItemThenChain: Record<number, Record<string, Product[]>> = {};
    
    // ראשית, נאסוף את כל ההתאמות האפשריות לכל פריט ברשימה
    activeItems.forEach((item, index) => {
      matchesByItemThenChain[index] = findMatchingProducts(
        allProducts, 
        item.name,
        item.product_code
      );
    });
    
    // עכשיו עבור כל פריט, נחפש את ההתאמה ברשת הנוכחית
    comparison.items.forEach((item, index) => {
      const matchesForItem = matchesByItemThenChain[index];
      
      // בדוק אם יש התאמות לרשת הנוכחית
      const chainMatches = matchesForItem[store.storeName] || [];
      
      if (chainMatches.length > 0) {
        console.log(`Found ${chainMatches.length} matching products for ${item.name} in chain ${store.storeName}`);
        
        // שמור את המוצר הזול ביותר כמוצר הראשי
        const cheapestProduct = chainMatches[0]; // כבר ממוין לפי מחיר
        
        comparison.items[index] = {
          ...item,
          price: cheapestProduct.price,
          matchedProduct: cheapestProduct.product_name,
          isAvailable: true,
          product_code: cheapestProduct.product_code,
          store_id: cheapestProduct.store_id,
          store_chain: cheapestProduct.store_chain,
          // שמור את כל המוצרים המתאימים מכל הרשתות
          matchedProducts: Object.values(matchesForItem).flat()
        };
        comparison.availableItemsCount++;
      } else {
        console.log(`No match found for ${item.name} in chain ${store.storeName}`);
        
        // אם אין התאמה ברשת הנוכחית, עדיין נשמור את כל ההתאמות מרשתות אחרות
        comparison.items[index].matchedProducts = Object.values(matchesForItem).flat();
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
