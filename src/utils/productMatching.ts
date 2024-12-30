import { calculateSimilarity } from './textSimilarity';

interface Product {
  store_chain: string;
  store_id: string | null;
  product_name: string;
  price: number;
  price_update_date?: string;
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
  const itemNameLower = itemName.toLowerCase();
  console.log(`Finding matches for item: ${itemName} (quantity: ${quantity})`);
  
  // Find all potential matches across all products with lower similarity threshold
  const potentialMatches = products
    .map(product => ({
      product,
      similarity: calculateSimilarity(itemNameLower, product.product_name.toLowerCase())
    }))
    .filter(match => {
      console.log(`Similarity for "${itemNameLower}" with "${match.product.product_name}": ${match.similarity}`);
      return match.similarity > 0.3; // Lowered threshold for better matching
    })
    .sort((a, b) => b.similarity - a.similarity);

  console.log('Potential matches found:', potentialMatches.length);

  // Group matches by store
  const matchesByStore = potentialMatches.reduce((acc, { product }) => {
    const key = `${product.store_chain}-${product.store_id || 'main'}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Add best match for each store
  for (const [storeKey, storeMatches] of Object.entries(matchesByStore)) {
    const bestMatch = storeMatches[0];
    if (bestMatch) {
      if (!storeProducts[storeKey]) {
        storeProducts[storeKey] = {
          storeName: bestMatch.store_chain,
          storeId: bestMatch.store_id,
          items: [],
          total: 0
        };
      }
      
      const itemPrice = bestMatch.price * quantity;
      storeProducts[storeKey].items.push({
        name: itemName,
        matchedProduct: bestMatch.product_name,
        price: itemPrice,
        priceUpdateDate: bestMatch.price_update_date,
        quantity
      });
      storeProducts[storeKey].total += itemPrice;
    }
  }

  return storeProducts;
}