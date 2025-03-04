
import { supabase } from '@/lib/supabase';

// רשימה סטטית של רשתות במקרה שאין תוצאות מה-API
export const fallbackStoreChains = [
  { name: 'רמי לוי', id: 'rami-levy', logo_url: null },
  { name: 'שופרסל', id: 'shufersal', logo_url: null },
  { name: 'יינות ביתן', id: 'yeinot-bitan', logo_url: null },
  { name: 'ויקטורי', id: 'victory', logo_url: null },
  { name: 'יוחננוף', id: 'yochananof', logo_url: null },
  { name: 'מחסני השוק', id: 'machsanei-hashuk', logo_url: null },
  { name: 'קרפור', id: 'carrefour', logo_url: null },
  { name: 'אושר עד', id: 'osher-ad', logo_url: null },
  { name: 'חצי חינם', id: 'hatzi-hinam', logo_url: null },
  { name: 'קשת טעמים', id: 'keshet-teamim', logo_url: null },
  { name: 'סופר יהודה', id: 'super-yehuda', logo_url: null },
  { name: 'פרש מרקט', id: 'fresh-market', logo_url: null },
  { name: 'פוליצר', id: 'politzer', logo_url: null },
  { name: 'ברקת', id: 'bareket', logo_url: null },
  { name: 'שוק העיר', id: 'shuk-hair', logo_url: null },
  { name: 'סופר פארם', id: 'super-pharm', logo_url: null },
  { name: 'סופר ספיר', id: 'super-sapir', logo_url: null },
  { name: 'סיטי מרקט', id: 'city-market', logo_url: null },
  { name: 'גוד פארם', id: 'good-pharm', logo_url: null },
  { name: 'סטופ מרקט', id: 'stop-market', logo_url: null },
  { name: 'היפר כהן', id: 'hyper-cohen', logo_url: null },
  { name: 'טיב טעם', id: 'tiv-taam', logo_url: null },
  { name: 'זול ובגדול', id: 'zol-vbgadol', logo_url: null },
  { name: 'משנת יוסף', id: 'mishnat-yosef', logo_url: null },
  { name: 'קינג סטור', id: 'king-store', logo_url: null },
  { name: 'נתיב החסד', id: 'netiv-hachesed', logo_url: null }
];

export interface StoreChain {
  name: string;
  id: string;
  logo_url?: string | null;
  key?: string;
}

// שליפת כל רשתות המזון מהדאטהבייס
export async function fetchStoreChains() {
  try {
    // ניסיון לשלוף מטבלת store_chains
    const { data: storeChains, error: storeError } = await supabase
      .from('store_chains')
      .select('id, name, logo_url')
      .order('name');

    if (storeError || !storeChains || storeChains.length === 0) {
      console.log('Falling back to unique store chains from store_products');
      
      // אם אין נתונים בטבלת store_chains, שולפים מטבלת store_products
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
        id: storeName.toLowerCase().replace(/\s+/g, '-'),
        logo_url: null
      }));
      
      // שילוב הרשימה הסטטית עם התוצאות מהדאטהבייס
      const combinedStores = [...storesFromDB];
      
      // הוספת חנויות מהרשימה הסטטית שחסרות בדאטהבייס
      fallbackStoreChains.forEach(store => {
        if (!combinedStores.some(s => s.name.trim().toLowerCase() === store.name.trim().toLowerCase())) {
          combinedStores.push(store);
        }
      });
      
      // מיון לפי שם
      return combinedStores.sort((a, b) => a.name.localeCompare(b.name, 'he'));
    }
    
    // אם יש נתונים ב-store_chains, להשתמש בהם
    const formattedStores = storeChains.map(store => ({
      name: store.name,
      id: store.id,
      logo_url: store.logo_url
    }));
    
    // הוספת חנויות מהרשימה הסטטית שחסרות בדאטהבייס
    const combinedStores = [...formattedStores];
    fallbackStoreChains.forEach(store => {
      if (!combinedStores.some(s => s.name.trim().toLowerCase() === store.name.trim().toLowerCase())) {
        combinedStores.push(store);
      }
    });
    
    return combinedStores.sort((a, b) => a.name.localeCompare(b.name, 'he'));
    
  } catch (error) {
    console.error('Error in fetchStoreChains:', error);
    return fallbackStoreChains;
  }
}
