
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
      normalizedName.includes('carrefour')) {
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
  
  if (normalizedName.includes('סופר פארם')) {
    return 'סופר פארם';
  }

  return storeName;
};
