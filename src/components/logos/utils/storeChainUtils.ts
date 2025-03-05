
import { supabase } from '@/lib/supabase';

// רשימה סטטית של רשתות במקרה שאין תוצאות מה-API
export const fallbackStoreChains = [
  { name: 'רמי לוי', id: 'rami-levy', logo_url: '/lovable-uploads/f7131837-8dd8-4e66-947a-54a1b9c7ebb4.png' },
  { name: 'שופרסל', id: 'shufersal', logo_url: '/lovable-uploads/d93c25df-9c2b-4fa3-ab6d-e0cb1b47de5d.png' },
  { name: 'יינות ביתן', id: 'yeinot-bitan', logo_url: '/lovable-uploads/f86638e1-48b0-4005-9df5-fbebc92daa6b.png' },
  { name: 'ויקטורי', id: 'victory', logo_url: '/lovable-uploads/83f1c27e-8de1-4b8c-83c1-d807211c28d9.png' },
  { name: 'יוחננוף', id: 'yochananof', logo_url: '/lovable-uploads/978e1e86-3aa9-4d9d-a9a1-56b56d8eebdf.png' },
  { name: 'מחסני השוק', id: 'machsanei-hashuk', logo_url: '/lovable-uploads/7382a403-382f-4b83-a2d2-50854e4f83d7.png' },
  { name: 'קרפור', id: 'carrefour', logo_url: '/lovable-uploads/47caafa9-5d58-4739-92d8-8fa9b7fd5e3c.png' },
  { name: 'אושר עד', id: 'osher-ad', logo_url: '/lovable-uploads/1f5589fb-c108-45ce-b235-a61909f72471.png' },
  { name: 'חצי חינם', id: 'hatzi-hinam', logo_url: '/lovable-uploads/1dc47ba7-26f0-461e-9822-5e477bd5ed31.png' },
  { name: 'סופר פארם', id: 'super-pharm', logo_url: '/lovable-uploads/34a32c41-1c66-475d-9801-5cf24750a931.png' },
  { name: 'טיב טעם', id: 'tiv-taam', logo_url: '/lovable-uploads/07a1d83a-7044-4aa8-9501-18010ad22ff6.png' },
  { name: 'קשת טעמים', id: 'keshet-teamim', logo_url: 'https://via.placeholder.com/100x100?text=קשת+טעמים' },
  { name: 'סופר יהודה', id: 'super-yehuda', logo_url: 'https://via.placeholder.com/100x100?text=סופר+יהודה' },
  { name: 'פרש מרקט', id: 'fresh-market', logo_url: 'https://via.placeholder.com/100x100?text=פרש+מרקט' },
  { name: 'פוליצר', id: 'politzer', logo_url: 'https://via.placeholder.com/100x100?text=פוליצר' },
  { name: 'ברקת', id: 'bareket', logo_url: 'https://via.placeholder.com/100x100?text=ברקת' },
  { name: 'שוק העיר', id: 'shuk-hair', logo_url: 'https://via.placeholder.com/100x100?text=שוק+העיר' },
  { name: 'סופר ספיר', id: 'super-sapir', logo_url: 'https://via.placeholder.com/100x100?text=סופר+ספיר' },
  { name: 'סיטי מרקט', id: 'city-market', logo_url: 'https://via.placeholder.com/100x100?text=סיטי+מרקט' },
  { name: 'גוד פארם', id: 'good-pharm', logo_url: 'https://via.placeholder.com/100x100?text=גוד+פארם' },
  { name: 'סטופ מרקט', id: 'stop-market', logo_url: 'https://via.placeholder.com/100x100?text=סטופ+מרקט' },
  { name: 'היפר כהן', id: 'hyper-cohen', logo_url: 'https://via.placeholder.com/100x100?text=היפר+כהן' },
  { name: 'זול ובגדול', id: 'zol-vbgadol', logo_url: 'https://via.placeholder.com/100x100?text=זול+ובגדול' },
  { name: 'משנת יוסף', id: 'mishnat-yosef', logo_url: 'https://via.placeholder.com/100x100?text=משנת+יוסף' },
  { name: 'קינג סטור', id: 'king-store', logo_url: 'https://via.placeholder.com/100x100?text=קינג+סטור' },
  { name: 'נתיב החסד', id: 'netiv-hachesed', logo_url: 'https://via.placeholder.com/100x100?text=נתיב+החסד' }
];

export interface StoreChain {
  name: string;
  id: string;
  logo_url?: string | null;
  key?: string;
}

// Helper function to get the correct logo URL for a store
export function getStoreLogoUrl(storeName: string): string | null {
  // Look for exact match first
  const exactMatch = fallbackStoreChains.find(
    store => store.name.trim() === storeName.trim()
  );
  
  if (exactMatch?.logo_url) {
    console.log(`Found exact logo match for ${storeName}: ${exactMatch.logo_url}`);
    return exactMatch.logo_url;
  }
  
  // Look for partial match
  const normalizedName = storeName.trim().toLowerCase();
  const partialMatch = fallbackStoreChains.find(
    store => normalizedName.includes(store.name.toLowerCase()) || 
             store.name.toLowerCase().includes(normalizedName)
  );
  
  if (partialMatch?.logo_url) {
    console.log(`Found partial logo match for ${storeName} using ${partialMatch.name}: ${partialMatch.logo_url}`);
    return partialMatch.logo_url;
  }
  
  console.log(`No logo match found for ${storeName}`);
  return null;
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
      
      // המרה לפורמט הנדרש ווידוא שיש תמיד URL של לוגו
      const formattedStores = storeChains.map(store => {
        // Find matching fallback store to ensure we have a logo URL
        const logoUrl = getStoreLogoUrl(store.name) || store.logo_url || 
                   `https://via.placeholder.com/100x100?text=${encodeURIComponent(store.name)}`;
        
        console.log(`Formatted store: ${store.name}, Using logo URL: ${logoUrl}`);
        
        return {
          name: store.name,
          id: store.id,
          logo_url: logoUrl
        };
      });
      
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
      // Get the appropriate logo URL
      const logoUrl = getStoreLogoUrl(storeName) || 
                      `https://via.placeholder.com/100x100?text=${encodeURIComponent(storeName)}`;
                      
      console.log(`Created store from product data: ${storeName}, Logo URL: ${logoUrl}`);
      
      return {
        name: storeName,
        id: storeName.toLowerCase().replace(/\s+/g, '-'),
        logo_url: logoUrl
      };
    });
    
    // מיון לפי שם
    return storesFromDB.sort((a, b) => a.name.localeCompare(b.name, 'he'));
  } catch (error) {
    console.error('Error in fetchStoreChains:', error);
    return fallbackStoreChains;
  }
}
