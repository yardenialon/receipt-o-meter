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

// Create a new interface for the minimum required properties
interface ProductMatchingItem {
  name: string;
  product_code?: string;
}

export const findMatchingProducts = (
  productMatches: Array<{ product_code: string; product_name: string }>,
  item: ProductMatchingItem
) => {
  // אם יש מק"ט, נשתמש בו במקום בשם המוצר
  if (item.product_code) {
    console.log('Looking for exact match by product code:', item.product_code);
    return productMatches.filter(match => match.product_code === item.product_code);
  }

  // אם אין מק"ט, נשתמש בחיפוש לפי שם כגיבוי
  const normalizedItemName = normalizeText(item.name);
  
  console.log('Looking for matches by name:', {
    originalName: item.name,
    normalizedName: normalizedItemName
  });

  const matches = productMatches.filter(match => {
    const normalizedProductName = normalizeText(match.product_name);
    const isMatch = normalizedProductName.includes(normalizedItemName) || 
                   normalizedItemName.includes(normalizedProductName);
    
    if (isMatch) {
      console.log('Found match:', {
        itemName: item.name,
        productName: match.product_name,
        productCode: match.product_code
      });
    }
    
    return isMatch;
  });

  console.log(`Found ${matches.length} matches for ${item.name}`);
  return matches;
};

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '') // הסרת גרשיים
    .replace(/\s+/g, ' ') // נירמול רווחים
    .replace(/[^\w\s]/g, '') // הסרת תווים מיוחדים
    .replace(/[a-zA-Z]/g, ''); // הסרת אותיות באנגלית
};

export const processStoreComparisons = (
  productsByStore: Record<string, StoreComparison>,
  activeItems: ShoppingListItem[],
  productMatches: Array<{ product_code: string; product_name: string }>
): StoreComparison[] => {
  return Object.values(productsByStore).map(store => {
    console.log('Processing store products:', {
      storeName: store.storeName,
      totalProducts: store.products?.length || 0
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
        // מציאת מקטים תואמים למוצר
        const matchingProductCodes = item.product_code ? 
          [item.product_code] : // אם יש מק"ט, נשתמש בו ישירות
          findMatchingProducts(productMatches, { name: item.name, product_code: item.product_code }).map(match => match.product_code);
        
        console.log('Found matching product codes for store:', {
          itemName: item.name,
          productCode: item.product_code,
          storeName: store.storeName,
          codes: matchingProductCodes
        });

        // מציאת המוצרים המתאימים בחנות הספציפית
        const matchingProducts = store.products?.filter(p => 
          matchingProductCodes.includes(p.product_code)
        );

        console.log('Matching store products:', {
          itemName: item.name,
          storeName: store.storeName,
          matches: matchingProducts?.length || 0
        });

        if (matchingProducts && matchingProducts.length > 0) {
          // בחירת המוצר הזול ביותר מבין המתאימים
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

          console.log('Found price for item:', {
            itemName: item.name,
            storeName: store.storeName,
            price: cheapestProduct.price,
            matchedProduct: cheapestProduct.product_name,
            productCode: cheapestProduct.product_code
          });
        } else {
          console.log('No matching products found for:', {
            itemName: item.name,
            productCode: item.product_code,
            storeName: store.storeName
          });
        }
      });

      // חישוב הסכום הכולל לחנות
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
