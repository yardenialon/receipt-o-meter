interface Product {
  store_chain: string;
  store_id: string | null;
  ItemCode: string;
  ItemName: string;
  ItemPrice: number;
  PriceUpdateDate?: string;
  [key: string]: any;
}

interface StoreProduct {
  storeName: string;
  storeId: string | null;
  items: Array<{
    name: string;
    matchedProduct: string;
    price: number;
    priceUpdateDate?: string;
    quantity: number;
  }>;
  total: number;
}

export function findMatchingProducts(
  itemName: string,
  quantity: number,
  products: Product[],
  storeProducts: Record<string, StoreProduct>
) {
  // Find the original product's ItemCode from the search results
  const originalProduct = products.find(p => p.ItemName === itemName);
  if (!originalProduct) {
    console.log(`No matching product found for: ${itemName}`);
    return storeProducts;
  }

  console.log(`Finding matches for item: ${itemName} (ItemCode: ${originalProduct.ItemCode})`);
  
  // Find all products with the same ItemCode across different stores
  const matchingProducts = products.filter(product => 
    product.ItemCode === originalProduct.ItemCode
  );

  console.log('Matching products found:', matchingProducts.length);

  // Group matches by store
  const matchesByStore = matchingProducts.reduce((acc, product) => {
    const key = `${product.store_chain}-${product.store_id || 'main'}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Add best match for each store
  for (const [storeKey, storeMatches] of Object.entries(matchesByStore)) {
    const bestMatch = storeMatches[0]; // Since all matches have the same ItemCode, we can take the first one
    if (bestMatch) {
      if (!storeProducts[storeKey]) {
        storeProducts[storeKey] = {
          storeName: bestMatch.store_chain,
          storeId: bestMatch.store_id,
          items: [],
          total: 0
        };
      }
      
      const itemPrice = bestMatch.ItemPrice * quantity;
      storeProducts[storeKey].items.push({
        name: itemName,
        matchedProduct: bestMatch.ItemName,
        price: itemPrice,
        priceUpdateDate: bestMatch.PriceUpdateDate,
        quantity
      });
      storeProducts[storeKey].total += itemPrice;
    }
  }

  return storeProducts;
}