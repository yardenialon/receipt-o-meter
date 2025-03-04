
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

  const tiVTaamVariations = [
    'טיב טעם', 'tiv taam', 'טיב טעם סניף', 'tiv-taam'
  ];

  const hatziHinamVariations = [
    'חצי חינם', 'hatzi hinam', 'חצי חינם סניף', 'hatzi-hinam'
  ];

  const mishnatYosefVariations = [
    'משנת יוסף', 'mishnat yosef', 'משנת יוסף סניף', 'mishnat-yosef'
  ];

  const yeinotBitanVariations = [
    'יינות ביתן', 'yeinot bitan', 'יינות ביתן סניף', 'yeinot-bitan'
  ];

  if (yochananofVariations.some(variant => normalizedName.includes(variant.toLowerCase()))) {
    return 'יוחננוף';
  } else if (ramiLevyVariations.some(variant => normalizedName.includes(variant.toLowerCase()))) {
    return 'רמי לוי';
  } else if (shufersalVariations.some(variant => normalizedName.includes(variant.toLowerCase()))) {
    return 'שופרסל';
  } else if (tiVTaamVariations.some(variant => normalizedName.includes(variant.toLowerCase()))) {
    return 'טיב טעם';
  } else if (hatziHinamVariations.some(variant => normalizedName.includes(variant.toLowerCase()))) {
    return 'חצי חינם';
  } else if (mishnatYosefVariations.some(variant => normalizedName.includes(variant.toLowerCase()))) {
    return 'משנת יוסף';
  } else if (yeinotBitanVariations.some(variant => normalizedName.includes(variant.toLowerCase()))) {
    return 'יינות ביתן';
  } else if (normalizedName.includes('קרפור') || normalizedName.includes('carrefour')) {
    return 'קרפור';
  }

  return storeName;
};
