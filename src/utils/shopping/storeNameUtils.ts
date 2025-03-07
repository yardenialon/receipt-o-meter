
// פונקציה לנרמול שם רשת
export const normalizeChainName = (storeName: string): string => {
  if (!storeName) return '';
  
  const normalizedName = storeName.toLowerCase().trim();
  
  // Map specific variations to their canonical store names
  // Using a more specific check for each chain to avoid cross-matching
  
  // רמי לוי - Make very specific to avoid confusion
  if (normalizedName.includes('רמי לוי') || 
      normalizedName.includes('שיווק השקמה') || 
      normalizedName === 'רמי לוי') {
    return 'רמי לוי';
  }
  
  // יוחננוף - various spellings
  if (normalizedName.includes('יוחננוף') || 
      normalizedName.includes('טוב טעם יוחננוף') || 
      normalizedName.includes('יוחננוב') || 
      normalizedName.includes('יוחנונוף')) {
    return 'יוחננוף';
  }
  
  // שופרסל variations
  if (normalizedName.includes('שופרסל') || normalizedName.includes('shufersal')) {
    return 'שופרסל';
  }
  
  // טיב טעם - avoid confusion with יוחננוף
  if ((normalizedName.includes('טיב טעם') || normalizedName === 'טיב טעם') && 
      !normalizedName.includes('יוחננוף')) {
    return 'טיב טעם';
  }
  
  // חצי חינם
  if (normalizedName.includes('חצי חינם')) {
    return 'חצי חינם';
  }
  
  // משנת יוסף
  if (normalizedName.includes('משנת יוסף')) {
    return 'משנת יוסף';
  }
  
  // יינות ביתן
  if (normalizedName.includes('יינות ביתן')) {
    return 'יינות ביתן';
  }
  
  // קרפור variants
  if (normalizedName.includes('קרפור') || normalizedName.includes('קארפור') || 
      normalizedName.includes('carrefour') || normalizedName.includes('כרפור')) {
    return 'קרפור';
  }
  
  // ויקטורי
  if (normalizedName.includes('ויקטורי')) {
    return 'ויקטורי';
  }
  
  // אושר עד
  if (normalizedName.includes('אושר עד')) {
    return 'אושר עד';
  }
  
  // מחסני השוק
  if (normalizedName.includes('מחסני השוק')) {
    return 'מחסני השוק';
  }
  
  // סופר פארם variants
  if (normalizedName.includes('סופר פארם') || normalizedName.includes('super pharm') || 
      normalizedName.includes('super-pharm') || normalizedName.includes('סופרפארם')) {
    return 'סופר פארם';
  }
  
  // קינג סטור
  if (normalizedName.includes('קינג סטור') || normalizedName.includes('king store')) {
    return 'קינג סטור';
  }
  
  // זול ובגדול
  if (normalizedName.includes('זול ובגדול')) {
    return 'זול ובגדול';
  }
  
  // נתיב החסד
  if (normalizedName.includes('נתיב החסד')) {
    return 'נתיב החסד';
  }
  
  // פרש מרקט
  if (normalizedName.includes('פרש מרקט') || normalizedName.includes('fresh market')) {
    return 'פרש מרקט';
  }
  
  // קשת טעמים
  if (normalizedName.includes('קשת טעמים')) {
    return 'קשת טעמים';
  }
  
  // סופר יהודה
  if (normalizedName.includes('סופר יהודה')) {
    return 'סופר יהודה';
  }

  // Return original if no mapping found
  return storeName;
};
