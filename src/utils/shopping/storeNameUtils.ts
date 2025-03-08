
// פונקציה לנרמול שם רשת
export const normalizeChainName = (storeName: string): string => {
  if (!storeName) return '';
  
  const normalizedName = storeName.toLowerCase().trim();
  
  // מיפוי שמות רשתות - מסודר לפי סדר חשיבות (למקרה של התנגשויות)
  // Map specific variations to their canonical store names
  if (normalizedName.includes('רמי לוי') || normalizedName.includes('שיווק השקמה')) {
    return 'רמי לוי';
  }
  
  if (normalizedName.includes('שופרסל') || normalizedName.includes('shufersal')) {
    return 'שופרסל';
  }
  
  if (normalizedName.includes('יוחננוף') || normalizedName.includes('טוב טעם יוחננוף') || 
      normalizedName.includes('יוחננוב') || normalizedName.includes('יוחנונוף')) {
    return 'יוחננוף';
  }
  
  if (normalizedName.includes('טיב טעם') && !normalizedName.includes('יוחננוף')) {
    return 'טיב טעם';
  }
  
  if (normalizedName.includes('חצי חינם')) {
    return 'חצי חינם';
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
  
  if (normalizedName.includes('משנת יוסף')) {
    return 'משנת יוסף';
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

  // מיפוי לרשתות קטנות יותר
  if (normalizedName.includes('ברקת')) {
    return 'ברקת';
  }
  
  if (normalizedName.includes('פוליצר')) {
    return 'פוליצר';
  }
  
  if (normalizedName.includes('שוק העיר')) {
    return 'שוק העיר';
  }

  if (normalizedName.includes('דור אלון') || normalizedName.includes('am:pm') || 
      normalizedName.includes('אמפם') || normalizedName.includes('אם:פם')) {
    return 'דור אלון AM:PM';
  }

  // Return original if no mapping found
  return storeName;
};

// מיפוי קבוע של לוגואים לרשתות
export const STORE_LOGOS: Record<string, string> = {
  'רמי לוי': '/lovable-uploads/f86638e1-48b0-4005-9df5-fbebc92daa6b.png',
  'שופרסל': '/lovable-uploads/a7f676f4-a172-4122-9bca-dc35a811739a.png',
  'יוחננוף': '/lovable-uploads/83f1c27e-8de1-4b8c-83c1-d807211c28d9.png',
  'טיב טעם': '/lovable-uploads/f7131837-8dd8-4e66-947a-54a1b9c7ebb4.png',
  'חצי חינם': '/lovable-uploads/f6b5d63b-6a6f-4ed4-a15f-4a3cda68e9db.png',
  'יינות ביתן': '/lovable-uploads/d93c25df-9c2b-4fa3-ab6d-e0cb1b47de5d.png',
  'קרפור': '/lovable-uploads/d81dbda8-194c-49d2-93fe-4cfbe17c10db.png',
  'ויקטורי': '/lovable-uploads/b1b23f5f-616a-4969-a1b1-b7e10a1338fb.png',
  'אושר עד': '/lovable-uploads/b04d4ae7-290f-4bfb-a8b2-4a9da2b16011.png',
  'מחסני השוק': '/lovable-uploads/978e1e86-3aa9-4d9d-a9a1-56b56d8eebdf.png',
  'סופר פארם': '/lovable-uploads/7382a403-382f-4b83-a2d2-50854e4f83d7.png',
  'קשת טעמים': '/lovable-uploads/47caafa9-5d58-4739-92d8-8fa9b7fd5e3c.png',
  'פרש מרקט': '/lovable-uploads/34a32c41-1c66-475d-9801-5cf24750a931.png',
  'סופר יהודה': '/lovable-uploads/2ec9e748-cf82-409e-a66f-89308a4585b2.png',
  'ברקת': '/lovable-uploads/1f5589fb-c108-45ce-b235-a61909f72471.png',
  'זול ובגדול': '/lovable-uploads/1dc47ba7-26f0-461e-9822-5e477bd5ed31.png',
  'קינג סטור': '/lovable-uploads/0b91faef-306a-433e-ab3e-ce812ecd1151.png',
  'משנת יוסף': '/lovable-uploads/07a1d83a-7044-4aa8-9501-18010ad22ff6.png'
};

// פונקציה לקבלת נתיב הלוגו של הרשת
export const getStoreLogo = (storeName: string): string | null => {
  const normalizedName = normalizeChainName(storeName);
  return STORE_LOGOS[normalizedName] || null;
};
