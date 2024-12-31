// Clean and normalize strings for comparison
export const normalizeText = (s: string) => {
  return s.toLowerCase()
    .trim()
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
  let totalWords = Math.max(words1.length, words2.length);
  
  // Check each word from str1 against str2
  for (const word1 of words1) {
    if (word1.length < 2) continue; // Skip very short words
    
    for (const word2 of words2) {
      if (word2.length < 2) continue;
      
      // Exact word match
      if (word1 === word2) {
        matches++;
        break;
      }
      
      // One word contains the other
      if (word1.length > 3 && word2.length > 3) {
        if (word2.includes(word1) || word1.includes(word2)) {
          matches += 0.8;
          break;
        }
      }
      
      // Partial match (start of word)
      if (word1.length > 3 && word2.length > 3) {
        if (word1.startsWith(word2) || word2.startsWith(word1)) {
          matches += 0.6;
          break;
        }
      }
    }
  }

  return matches / totalWords;
}