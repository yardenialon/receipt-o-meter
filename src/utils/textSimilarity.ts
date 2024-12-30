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

// Clean and normalize strings for comparison
export const normalizeText = (s: string) => {
  return s.toLowerCase().trim()
    .replace(/['".,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
};

// Calculate similarity between two strings
export function calculateSimilarity(str1: string, str2: string): number {
  // Clean and normalize strings
  const n1 = normalizeText(str1);
  const n2 = normalizeText(str2);

  // Exact match
  if (n1 === n2) return 1;

  // One string contains the other
  if (n1.includes(n2) || n2.includes(n1)) return 0.9;

  const words1 = n1.split(/\s+/);
  const words2 = n2.split(/\s+/);
  
  let matches = 0;
  
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
      if (word1.length > 2 && word2.length > 2) {
        const distance = levenshteinDistance(word1, word2);
        const maxLength = Math.max(word1.length, word2.length);
        const similarity = 1 - (distance / maxLength);
        if (similarity > 0.6) { // Lowered threshold for better matching
          bestWordMatch = Math.max(bestWordMatch, similarity);
        }
      }
    }
    
    matches += bestWordMatch;
  }

  // Calculate final similarity score with more lenient thresholds
  return matches / Math.max(words1.length, 1);
}