
import { supabase } from '@/lib/supabase';
import { normalizeChainName } from '@/utils/shopping/storeNameUtils';

// Fallback store chains with standardized paths using chain-id based naming convention
export const fallbackStoreChains = [
  { name: 'רמי לוי', id: 'rami-levy', logo_url: '/lovable-uploads/rami-levy-logo.png' },
  { name: 'שופרסל', id: 'shufersal', logo_url: '/lovable-uploads/shufersal-logo.png' },
  { name: 'יינות ביתן', id: 'yeinot-bitan', logo_url: '/lovable-uploads/yeinot-bitan-logo.png' },
  { name: 'ויקטורי', id: 'victory', logo_url: '/lovable-uploads/victory-logo.png' },
  { name: 'יוחננוף', id: 'yochananof', logo_url: '/lovable-uploads/yochananof-logo.png' },
  { name: 'מחסני השוק', id: 'machsanei-hashuk', logo_url: '/lovable-uploads/machsanei-hashuk-logo.png' },
  { name: 'אושר עד', id: 'osher-ad', logo_url: '/lovable-uploads/osher-ad-logo.png' },
  { name: 'חצי חינם', id: 'hatzi-hinam', logo_url: '/lovable-uploads/hatzi-hinam-logo.png' },
  { name: 'סופר פארם', id: 'super-pharm', logo_url: '/lovable-uploads/super-pharm-logo.png' },
  { name: 'טיב טעם', id: 'tiv-taam', logo_url: '/lovable-uploads/tiv-taam-logo.png' },
  { name: 'קרפור', id: 'carrefour', logo_url: '/lovable-uploads/carrefour-logo.png' },
  { name: 'קשת טעמים', id: 'keshet-teamim', logo_url: '/lovable-uploads/keshet-teamim-logo.png' },
  { name: 'סופר יהודה', id: 'super-yehuda', logo_url: '/lovable-uploads/super-yehuda-logo.png' },
  { name: 'פרש מרקט', id: 'fresh-market', logo_url: '/lovable-uploads/fresh-market-logo.png' },
  { name: 'פוליצר', id: 'politzer', logo_url: '/lovable-uploads/politzer-logo.png' },
  { name: 'ברקת', id: 'bareket', logo_url: '/lovable-uploads/bareket-logo.png' },
  { name: 'שוק העיר', id: 'shuk-hair', logo_url: '/lovable-uploads/shuk-hair-logo.png' },
  { name: 'סופר ספיר', id: 'super-sapir', logo_url: '/lovable-uploads/super-sapir-logo.png' },
  { name: 'סיטי מרקט', id: 'city-market', logo_url: '/lovable-uploads/city-market-logo.png' },
  { name: 'גוד פארם', id: 'good-pharm', logo_url: '/lovable-uploads/good-pharm-logo.png' },
  { name: 'סטופ מרקט', id: 'stop-market', logo_url: '/lovable-uploads/stop-market-logo.png' },
  { name: 'היפר כהן', id: 'hyper-cohen', logo_url: '/lovable-uploads/hyper-cohen-logo.png' },
  { name: 'זול ובגדול', id: 'zol-vbgadol', logo_url: '/lovable-uploads/zol-vbgadol-logo.png' },
  { name: 'משנת יוסף', id: 'mishnat-yosef', logo_url: '/lovable-uploads/mishnat-yosef-logo.png' },
  { name: 'קינג סטור', id: 'king-store', logo_url: '/lovable-uploads/king-store-logo.png' },
  { name: 'נתיב החסד', id: 'netiv-hachesed', logo_url: '/lovable-uploads/netiv-hachesed-logo.png' }
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
      
      // המרה לפורמט הנדרש
      const formattedStores = storeChains.map(store => {
        // Make sure logo_url has the correct path prefix if needed
        let logoUrl = store.logo_url;
        
        // Normalize the store name
        const normalizedName = normalizeChainName(store.name);
        
        // Find matching fallback for consistent logo URLs
        const fallback = fallbackStoreChains.find(s => 
          normalizeChainName(s.name).trim().toLowerCase() === normalizedName.trim().toLowerCase()
        );
        
        // If logo URL doesn't exist or is invalid, use fallback
        if (!logoUrl || logoUrl === '' || logoUrl.includes('placeholder')) {
          logoUrl = fallback?.logo_url;
        }
        // If logo URL is relative and doesn't start with /, add /
        else if (logoUrl && !logoUrl.startsWith('/') && !logoUrl.startsWith('http')) {
          logoUrl = '/' + logoUrl;
        }
        
        return {
          name: normalizedName,
          id: store.id,
          logo_url: logoUrl || `/lovable-uploads/${normalizedName.toLowerCase().replace(/\s+/g, '-')}-logo.png`
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
      const normalizedName = normalizeChainName(storeName);
      
      // Find matching fallback logo
      const fallback = fallbackStoreChains.find(s => 
        normalizeChainName(s.name).trim().toLowerCase() === normalizedName.trim().toLowerCase()
      );
      
      const logoUrl = fallback?.logo_url || 
                     `https://via.placeholder.com/100x100?text=${encodeURIComponent(normalizedName)}`;
      
      return {
        name: normalizedName,
        id: normalizedName.toLowerCase().replace(/\s+/g, '-'),
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
