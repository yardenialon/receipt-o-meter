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

// Interface for the minimum required properties for product matching
interface ProductMatchingItem {
  name: string;
  product_code?: string;
}

export const findMatchingProducts = (
  productMatches: Array<{ product_code: string; product_name: string }>,
  item: ProductMatchingItem
) => {
  // If we have a product code, use it for exact matching
  if (item.product_code) {
    console.log('Looking for exact match by product code:', item.product_code);
    const exactMatches = productMatches.filter(match => match.product_code === item.product_code);
    if (exactMatches.length > 0) {
      return exactMatches;
    }
  }

  // Only proceed with name matching if no product code match was found
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
    .replace(/['"]/g, '') // Remove quotes
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/[a-zA-Z]/g, ''); // Remove English letters
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
        // If we have a product code, only look for exact matches
        if (item.product_code) {
          const matchingProduct = store.products?.find(p => p.product_code === item.product_code);
          if (matchingProduct) {
            comparison.items[index] = {
              ...item,
              price: matchingProduct.price,
              matchedProduct: matchingProduct.product_name,
              isAvailable: true,
              product_code: matchingProduct.product_code
            };
            comparison.availableItemsCount++;
          }
        } else {
          // Only use name matching if no product code is available
          const matchingProductCodes = findMatchingProducts(productMatches, { 
            name: item.name, 
            product_code: item.product_code 
          }).map(match => match.product_code);
          
          console.log('Found matching product codes for store:', {
            itemName: item.name,
            productCode: item.product_code,
            storeName: store.storeName,
            codes: matchingProductCodes
          });

          // Find matching products in this specific store
          const matchingProducts = store.products?.filter(p => 
            matchingProductCodes.includes(p.product_code)
          );

          console.log('Matching store products:', {
            itemName: item.name,
            storeName: store.storeName,
            matches: matchingProducts?.length || 0
          });

          if (matchingProducts && matchingProducts.length > 0) {
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
          }
        }
      });

      // Calculate total for the store
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