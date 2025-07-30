
import { supabase } from '@/lib/supabase';

// רשימה סטטית של רשתות במקרה שאין תוצאות מה-API
export const fallbackStoreChains = [
  { name: 'רמי לוי', id: 'rami-levy' },
  { name: 'שופרסל', id: 'shufersal' },
  { name: 'יינות ביתן', id: 'yeinot-bitan' },
  { name: 'ויקטורי', id: 'victory' },
  { name: 'יוחננוף', id: 'yochananof' },
  { name: 'מחסני השוק', id: 'machsanei-hashuk' },
  { name: 'קרפור', id: 'carrefour' },
  { name: 'אושר עד', id: 'osher-ad' },
  { name: 'חצי חינם', id: 'hatzi-hinam' },
  { name: 'קשת טעמים', id: 'keshet-teamim' },
  { name: 'סופר יהודה', id: 'super-yehuda' },
  { name: 'פרש מרקט', id: 'fresh-market' },
  { name: 'פוליצר', id: 'politzer' },
  { name: 'ברקת', id: 'bareket' },
  { name: 'שוק העיר', id: 'shuk-hair' },
  { name: 'סופר פארם', id: 'super-pharm' },
  { name: 'סופר ספיר', id: 'super-sapir' },
  { name: 'סיטי מרקט', id: 'city-market' },
  { name: 'גוד פארם', id: 'good-pharm' },
  { name: 'סטופ מרקט', id: 'stop-market' },
  { name: 'היפר כהן', id: 'hyper-cohen' },
  { name: 'טיב טעם', id: 'tiv-taam' },
  { name: 'זול ובגדול', id: 'zol-vbgadol' },
  { name: 'משנת יוסף', id: 'mishnat-yosef' },
  { name: 'קינג סטור', id: 'king-store' },
  { name: 'נתיב החסד', id: 'netiv-hachesed' }
];

export interface StoreChain {
  name: string;
  id: string;
  key?: string;
}

// שליפת כל רשתות המזון מהדאטהבייס
export async function fetchStoreChains() {
  // כרגע נשתמש ברשימה הסטטית בלבד עד שתהיה לנו טבלת store_products
  return fallbackStoreChains;
  
  /*
  TODO: לפתח כשתהיה טבלת store_products
  const { data, error } = await supabase
    .from('store_products')
    .select('store_chain')
    .order('store_chain')
    .not('store_chain', 'is', null);

  if (error) {
    console.error('Error fetching store chains:', error);
    return fallbackStoreChains;
  }

  // הסרת כפילויות
  const uniqueStores = Array.from(new Set(data.map(item => item.store_chain)));
  
  // המרה לפורמט הנדרש
  const storesFromDB = uniqueStores.map(storeName => ({
    name: storeName,
    id: storeName.toLowerCase().replace(/\s+/g, '-')
  }));
  
  // שילוב הרשימה הסטטית עם התוצאות מהדאטהבייס
  // ייצור רשימה משולבת ללא כפילויות
  const combinedStores = [...storesFromDB];
  
  // הוספת חנויות מהרשימה הסטטית שחסרות בדאטהבייס
  fallbackStoreChains.forEach(store => {
    if (!combinedStores.some(s => s.name.trim().toLowerCase() === store.name.trim().toLowerCase())) {
      combinedStores.push(store);
    }
  });
  
  // מיון לפי שם
  return combinedStores.sort((a, b) => a.name.localeCompare(b.name, 'he'));
  */
}
