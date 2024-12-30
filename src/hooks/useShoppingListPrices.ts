import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface ShoppingListItem {
  name: string;
  is_completed?: boolean;
}

export const useShoppingListPrices = (items: ShoppingListItem[] = []) => {
  return useQuery({
    queryKey: ['shopping-list-prices', items.map(i => i.name).join(',')],
    queryFn: async () => {
      if (!items.length) return [];

      const activeItems = items.filter(item => !item.is_completed);
      if (!activeItems.length) return [];

      console.log('Active items to compare:', activeItems);

      // Get all store products that match any of our items
      const { data: products, error } = await supabase
        .from('store_products')
        .select('*')
        .filter('item_status', 'eq', 'active');

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      if (!products?.length) {
        console.log('No products found in database');
        return [];
      }

      console.log('Found products:', products.length);

      // Group products by store
      const storeProducts = products.reduce((acc, product) => {
        const key = `${product.store_chain}-${product.store_id || 'main'}`;
        if (!acc[key]) {
          acc[key] = {
            storeName: product.store_chain,
            items: [],
            total: 0
          };
        }
        return acc;
      }, {} as Record<string, { storeName: string; items: any[]; total: number }>);

      // For each store, find best matching products for our items
      for (const item of activeItems) {
        const itemName = item.name.toLowerCase();
        console.log('Finding matches for item:', itemName);
        
        // Find all potential matches across all products
        const potentialMatches = products
          .map(product => ({
            product,
            similarity: calculateSimilarity(itemName, product.product_name.toLowerCase())
          }))
          .filter(match => {
            // Log similarity scores for debugging
            console.log(`Similarity for "${itemName}" with "${match.product.product_name}": ${match.similarity}`);
            return match.similarity > 0.3;
          })
          .sort((a, b) => b.similarity - a.similarity);

        console.log('Potential matches found:', potentialMatches.length);

        // Group matches by store
        const matchesByStore = potentialMatches.reduce((acc, { product }) => {
          const key = `${product.store_chain}-${product.store_id || 'main'}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(product);
          return acc;
        }, {} as Record<string, any[]>);

        // Add best match for each store
        for (const [storeKey, storeMatches] of Object.entries(matchesByStore)) {
          const bestMatch = storeMatches[0]; // Already sorted by similarity
          if (bestMatch) {
            storeProducts[storeKey].items.push({
              name: item.name,
              matchedProduct: bestMatch.product_name,
              price: bestMatch.price
            });
            storeProducts[storeKey].total += bestMatch.price;
          }
        }
      }

      // Convert to array and filter stores that don't have all items
      const results = Object.values(storeProducts)
        .filter(store => store.items.length === activeItems.length)
        .sort((a, b) => a.total - b.total);

      console.log('Final comparison results:', results);
      return results;
    },
    enabled: items.length > 0
  });
};

// Improved similarity calculation function
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  
  let matches = 0;
  let totalWords = Math.max(words1.length, words2.length);
  
  for (const word1 of words1) {
    for (const word2 of words2) {
      // Check for exact match
      if (word1 === word2) {
        matches += 1;
        continue;
      }
      
      // Check for partial match
      if (word2.includes(word1) || word1.includes(word2)) {
        matches += 0.5;
      }
    }
  }
  
  return matches / totalWords;
}