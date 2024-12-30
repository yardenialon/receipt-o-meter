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
            storeId: product.store_id,
            items: [],
            total: 0
          };
        }
        return acc;
      }, {} as Record<string, { storeName: string; storeId: string | null; items: any[]; total: number }>);

      // For each store, find best matching products for our items
      for (const item of activeItems) {
        const itemName = item.name.toLowerCase();
        console.log('Finding matches for item:', itemName);
        
        // Find all potential matches across all products
        const potentialMatches = products
          .map(product => ({
            product,
            similarity: calculateImprovedSimilarity(itemName, product.product_name.toLowerCase())
          }))
          .filter(match => {
            // Log similarity scores for debugging
            console.log(`Similarity for "${itemName}" with "${match.product.product_name}": ${match.similarity}`);
            return match.similarity > 0.4; // Increased threshold for better matches
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
              price: bestMatch.price,
              priceUpdateDate: bestMatch.price_update_date
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

// Improved similarity calculation function with additional matching strategies
function calculateImprovedSimilarity(str1: string, str2: string): number {
  // Clean and normalize strings
  const normalize = (s: string) => s.toLowerCase().trim()
    .replace(/['".,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');

  const n1 = normalize(str1);
  const n2 = normalize(str2);

  // Exact match
  if (n1 === n2) return 1;

  // One string contains the other
  if (n1.includes(n2) || n2.includes(n1)) return 0.9;

  const words1 = n1.split(/\s+/);
  const words2 = n2.split(/\s+/);
  
  let matches = 0;
  let partialMatches = 0;
  
  // Check each word from the search term against the product name
  for (const word1 of words1) {
    let bestWordMatch = 0;
    
    for (const word2 of words2) {
      // Exact word match
      if (word1 === word2) {
        bestWordMatch = 1;
        break;
      }
      
      // One word contains the other (minimum 3 characters)
      if (word1.length >= 3 && word2.length >= 3) {
        if (word2.includes(word1) || word1.includes(word2)) {
          bestWordMatch = Math.max(bestWordMatch, 0.8);
          continue;
        }
      }
      
      // Calculate Levenshtein distance for similar words
      if (word1.length > 3 && word2.length > 3) {
        const distance = levenshteinDistance(word1, word2);
        const maxLength = Math.max(word1.length, word2.length);
        const similarity = 1 - (distance / maxLength);
        if (similarity > 0.7) {
          bestWordMatch = Math.max(bestWordMatch, similarity);
        }
      }
    }
    
    matches += bestWordMatch;
  }

  // Calculate final similarity score
  const weightedScore = matches / words1.length;
  
  // Boost score if key words match exactly
  const keyWords1 = words1.filter(w => w.length > 3);
  const keyWords2 = words2.filter(w => w.length > 3);
  const keyWordMatches = keyWords1.filter(w => keyWords2.includes(w)).length;
  const keyWordBonus = keyWordMatches > 0 ? 0.2 : 0;

  return Math.min(1, weightedScore + keyWordBonus);
}

// Helper function to calculate Levenshtein distance
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1
        );
      }
    }
  }

  return dp[m][n];
}