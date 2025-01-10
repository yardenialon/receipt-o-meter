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

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '') // Remove quotes
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/[^\w\s]/g, ''); // Remove special characters
};

export const findMatchingProducts = (
  productMatches: Array<{ product_code: string; product_name: string }>,
  item: ShoppingListItem
) => {
  const normalizedItemName = normalizeText(item.name);
  
  console.log('Looking for matches for:', {
    originalName: item.name,
    normalizedName: normalizedItemName
  });

  return productMatches.filter(match => {
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
        isAvailable: false
      })),
      total: 0,
      availableItemsCount: 0
    };

    if (store.products) {
      comparison.items.forEach((item, index) => {
        const matchingProductCodes = findMatchingProducts(productMatches, { name: item.name })
          .map(match => match.product_code);
        
        console.log('Found matching product codes:', {
          itemName: item.name,
          codes: matchingProductCodes
        });

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
            isAvailable: true
          };
          comparison.total += cheapestProduct.price * item.quantity;
          comparison.availableItemsCount++;

          console.log('Found price for item:', {
            itemName: item.name,
            storeName: store.storeName,
            price: cheapestProduct.price,
            matchedProduct: cheapestProduct.product_name
          });
        }
      });
    }

    return comparison;
  });
};