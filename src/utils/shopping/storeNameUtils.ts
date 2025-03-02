
import { Product } from '@/types/shopping';

// פונקציה לנרמול שם רשת
export const normalizeChainName = (storeName: string): string => {
  if (!storeName) return '';
  
  const normalizedName = storeName.toLowerCase().trim();
  
  const yochananofVariations = [
    'yochananof', 'יוחננוף', 'יוחנונוף', 'יוחננוב',
    'יוחננוף טוב טעם', 'יוחננוף טוב טעם בעמ', 'טוב טעם יוחננוף',
    'טוב טעם', 'tov taam', 'tovtaam', 'טוב טעם בעמ', 'טוב טעם רשת'
  ];

  const ramiLevyVariations = [
    'רמי לוי', 'rami levy', 'רמי לוי שיווק השקמה',
    'שיווק השקמה', 'רמי לוי שיווק השיקמה', 'רמי לוי סניף'
  ];

  const shufersalVariations = [
    'שופרסל', 'shufersal', 'שופרסל אונליין',
    'שופרסל דיל', 'שופרסל שלי', 'שופרסל אקספרס'
  ];

  if (yochananofVariations.some(variant => normalizedName.includes(variant.toLowerCase()))) {
    return 'יוחננוף';
  } else if (ramiLevyVariations.some(variant => normalizedName.includes(variant.toLowerCase()))) {
    return 'רמי לוי';
  } else if (shufersalVariations.some(variant => normalizedName.includes(variant.toLowerCase()))) {
    return 'שופרסל';
  }

  return storeName;
};
