
import { Product } from '@/types/shopping';
import { normalizeChainName } from './storeNameUtils';

// פונקציה משופרת לחיפוש מוצרים מתאימים - החזרת מערך של כל המוצרים המתאימים בכל הרשתות
export const findMatchingProducts = (
  allProducts: Product[],
  itemName: string,
  productCode?: string | null
): Record<string, Product[]> => {
  if (!allProducts || !allProducts.length) return {};
  
  // אנחנו רוצים לחפש מוצרים בכל הרשתות, לא רק ברשת אחת
  const matchesByChain: Record<string, Product[]> = {};
  
  const addProductMatch = (product: Product) => {
    if (!product.store_chain) return;
    
    const chainName = normalizeChainName(product.store_chain);
    if (!matchesByChain[chainName]) {
      matchesByChain[chainName] = [];
    }
    matchesByChain[chainName].push(product);
  };
  
  // אם יש לנו קוד מוצר, נחפש התאמה מדויקת
  if (productCode) {
    const exactCodeMatches = allProducts.filter(p => p.product_code === productCode);
    if (exactCodeMatches.length > 0) {
      console.log(`Found ${exactCodeMatches.length} exact matches by product code for ${itemName}`);
      // מיון לפי מחיר נמוך תחילה בכל רשת
      exactCodeMatches.forEach(addProductMatch);
      
      // מיון המוצרים בכל רשת לפי מחיר נמוך תחילה
      Object.keys(matchesByChain).forEach(chain => {
        matchesByChain[chain].sort((a, b) => a.price - b.price);
      });
      
      return matchesByChain;
    }
  }
  
  // אחרת, נחפש לפי שם מוצר
  // התאמה מלאה (אחד מכיל את השני)
  const nameMatches = allProducts.filter(p => {
    const productNameLower = p.product_name.toLowerCase();
    const itemNameLower = itemName.toLowerCase();
    
    return productNameLower.includes(itemNameLower) || 
           itemNameLower.includes(productNameLower);
  });
  
  if (nameMatches.length > 0) {
    // מיון התוצאות - העדפה למחיר נמוך יותר
    console.log(`Found ${nameMatches.length} name matches for ${itemName}`);
    nameMatches.forEach(addProductMatch);
    
    // מיון המוצרים בכל רשת לפי מחיר נמוך תחילה
    Object.keys(matchesByChain).forEach(chain => {
      matchesByChain[chain].sort((a, b) => a.price - b.price);
    });
    
    return matchesByChain;
  }
  
  // התאמה חלקית (מילים משותפות)
  const partialMatches = allProducts.filter(p => {
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
    partialMatches.forEach(addProductMatch);
    
    // מיון המוצרים בכל רשת לפי מחיר נמוך תחילה
    Object.keys(matchesByChain).forEach(chain => {
      matchesByChain[chain].sort((a, b) => a.price - b.price);
    });
    
    return matchesByChain;
  }
  
  return {};
};
