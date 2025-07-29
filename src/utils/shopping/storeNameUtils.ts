
// פונקציה לנרמול שם רשת
export const normalizeChainName = (storeName: string): string => {
  if (!storeName) return '';
  
  const normalizedName = storeName.toLowerCase().trim();
  
  // Map specific variations to their canonical store names
  if (normalizedName.includes('יוחננוף') || normalizedName.includes('טוב טעם יוחננוף') || 
      normalizedName.includes('יוחננוב') || normalizedName.includes('יוחנונוף')) {
    return 'יוחננוף';
  }
  
  if (normalizedName.includes('רמי לוי') || normalizedName.includes('שיווק השקמה')) {
    return 'רמי לוי';
  }
  
  if (normalizedName.includes('שופרסל') || normalizedName.includes('shufersal')) {
    return 'שופרסל';
  }
  
  if (normalizedName.includes('טיב טעם') && !normalizedName.includes('יוחננוף')) {
    return 'טיב טעם';
  }
  
  if (normalizedName.includes('חצי חינם')) {
    return 'חצי חינם';
  }
  
  if (normalizedName.includes('משנת יוסף')) {
    return 'משנת יוסף';
  }
  
  if (normalizedName.includes('יינות ביתן')) {
    return 'יינות ביתן';
  }
  
  if (normalizedName.includes('קרפור') || normalizedName.includes('קארפור') || 
      normalizedName.includes('carrefour') || normalizedName.includes('כרפור')) {
    return 'קרפור';
  }
  
  if (normalizedName.includes('ויקטורי')) {
    return 'ויקטורי';
  }
  
  if (normalizedName.includes('אושר עד')) {
    return 'אושר עד';
  }
  
  if (normalizedName.includes('מחסני השוק')) {
    return 'מחסני השוק';
  }
  
  if (normalizedName.includes('סופר פארם') || normalizedName.includes('super pharm') || 
      normalizedName.includes('super-pharm') || normalizedName.includes('סופרפארם')) {
    return 'סופר פארם';
  }
  
  if (normalizedName.includes('קינג סטור') || normalizedName.includes('king store')) {
    return 'קינג סטור';
  }
  
  if (normalizedName.includes('זול ובגדול')) {
    return 'זול ובגדול';
  }
  
  if (normalizedName.includes('נתיב החסד')) {
    return 'נתיב החסד';
  }
  
  if (normalizedName.includes('פרש מרקט') || normalizedName.includes('fresh market')) {
    return 'פרש מרקט';
  }
  
  if (normalizedName.includes('קשת טעמים')) {
    return 'קשת טעמים';
  }
  
  if (normalizedName.includes('סופר יהודה')) {
    return 'סופר יהודה';
  }

  // Return original if no mapping found
  return storeName;
};
