
import { supabase } from '@/lib/supabase';

// רשימה סטטית של רשתות במקרה שאין תוצאות מה-API
export const fallbackStoreChains = [
  { name: 'רמי לוי', id: 'rami-levy', logo_url: 'https://www.rami-levy.co.il/files/design/logo.png' },
  { name: 'שופרסל', id: 'shufersal', logo_url: 'https://www.shufersal.co.il/_layouts/images/Shufersal/favicon.png' },
  { name: 'יינות ביתן', id: 'yeinot-bitan', logo_url: 'https://www.ybitan.co.il/UploadImages/11_2018/headerLogo.png' },
  { name: 'ויקטורי', id: 'victory', logo_url: 'https://d5nunyagcicgy.cloudfront.net/thumbnails/victory-logo-png-2134.png' },
  { name: 'יוחננוף', id: 'yochananof', logo_url: 'https://yochananof.co.il/wp-content/uploads/2019/10/yochananof-logo.png' },
  { name: 'מחסני השוק', id: 'machsanei-hashuk', logo_url: 'https://www.m-hashuk.co.il/Content/images/logo.png' },
  { name: 'קרפור', id: 'carrefour', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Carrefour_logo.svg/1200px-Carrefour_logo.svg.png' },
  { name: 'אושר עד', id: 'osher-ad', logo_url: 'https://www.osheradmarket.co.il/images/Header/Osher_Ad_Logo.jpg' },
  { name: 'חצי חינם', id: 'hatzi-hinam', logo_url: 'https://www.hatzi-hinam.co.il/wp-content/uploads/2021/10/HHlogo.png' },
  { name: 'קשת טעמים', id: 'keshet-teamim', logo_url: null },
  { name: 'סופר יהודה', id: 'super-yehuda', logo_url: null },
  { name: 'פרש מרקט', id: 'fresh-market', logo_url: null },
  { name: 'פוליצר', id: 'politzer', logo_url: null },
  { name: 'ברקת', id: 'bareket', logo_url: null },
  { name: 'שוק העיר', id: 'shuk-hair', logo_url: null },
  { name: 'סופר פארם', id: 'super-pharm', logo_url: 'https://www.super-pharm.co.il/on/demandware.static/-/Sites/default/dw5bab13d9/superpharm-Logo-header.png' },
  { name: 'סופר ספיר', id: 'super-sapir', logo_url: null },
  { name: 'סיטי מרקט', id: 'city-market', logo_url: null },
  { name: 'גוד פארם', id: 'good-pharm', logo_url: null },
  { name: 'סטופ מרקט', id: 'stop-market', logo_url: null },
  { name: 'היפר כהן', id: 'hyper-cohen', logo_url: null },
  { name: 'טיב טעם', id: 'tiv-taam', logo_url: 'https://www.tivtaam.co.il/wp-content/uploads/2018/10/tiv.png' },
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
    console.log('Fetching store chains from database...');
    
    // שליפה מטבלת store_chains
    const { data: storeChains, error: storeError } = await supabase
      .from('store_chains')
      .select('id, name, logo_url')
      .order('name');

    if (storeError) {
      console.error('Error fetching from store_chains:', storeError);
      return fallbackStoreChains;
    }

    if (storeChains && storeChains.length > 0) {
      console.log(`Found ${storeChains.length} store chains in database`);
      console.log('Store chains from DB:', storeChains);
      
      // המרה לפורמט הנדרש
      const formattedStores = storeChains.map(store => ({
        name: store.name,
        id: store.id,
        logo_url: store.logo_url
      }));
      
      return formattedStores;
    }
    
    // אם אין נתונים בטבלת store_chains, שולפים מטבלת store_products
    console.log('No data in store_chains, falling back to unique store chains from store_products');
    const { data, error } = await supabase
      .from('store_products')
      .select('store_chain')
      .order('store_chain')
      .not('store_chain', 'is', null);

    if (error) {
      console.error('Error fetching store chains from store_products:', error);
      return fallbackStoreChains;
    }

    // הסרת כפילויות
    const uniqueStores = Array.from(new Set(data.map(item => item.store_chain)));
    
    // המרה לפורמט הנדרש
    const storesFromDB = uniqueStores.map(storeName => {
      // Find matching fallback store if available
      const fallbackStore = fallbackStoreChains.find(
        store => store.name.trim().toLowerCase() === storeName.trim().toLowerCase()
      );
      
      return {
        name: storeName,
        id: storeName.toLowerCase().replace(/\s+/g, '-'),
        logo_url: fallbackStore?.logo_url || null
      };
    });
    
    // מיון לפי שם
    return storesFromDB.sort((a, b) => a.name.localeCompare(b.name, 'he'));
  } catch (error) {
    console.error('Error in fetchStoreChains:', error);
    return fallbackStoreChains;
  }
}
