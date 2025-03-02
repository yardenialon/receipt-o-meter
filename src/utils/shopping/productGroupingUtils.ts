
import { Product, StoreComparison } from '@/types/shopping';
import { normalizeChainName } from './storeNameUtils';

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
