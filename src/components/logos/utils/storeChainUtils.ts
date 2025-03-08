
import { supabase } from '@/lib/supabase';
import { normalizeChainName, STORE_LOGOS } from '@/utils/shopping/storeNameUtils';

// Fallback store chains עם שמות מנורמלים
export const fallbackStoreChains = [
  { name: 'רמי לוי', id: 'rami-levy', logo_url: STORE_LOGOS['רמי לוי'] },
  { name: 'שופרסל', id: 'shufersal', logo_url: STORE_LOGOS['שופרסל'] },
  { name: 'יינות ביתן', id: 'yeinot-bitan', logo_url: STORE_LOGOS['יינות ביתן'] },
  { name: 'ויקטורי', id: 'victory', logo_url: STORE_LOGOS['ויקטורי'] },
  { name: 'יוחננוף', id: 'yochananof', logo_url: STORE_LOGOS['יוחננוף'] },
  { name: 'מחסני השוק', id: 'machsanei-hashuk', logo_url: STORE_LOGOS['מחסני השוק'] },
  { name: 'אושר עד', id: 'osher-ad', logo_url: STORE_LOGOS['אושר עד'] },
  { name: 'חצי חינם', id: 'hatzi-hinam', logo_url: STORE_LOGOS['חצי חינם'] },
  { name: 'סופר פארם', id: 'super-pharm', logo_url: STORE_LOGOS['סופר פארם'] },
  { name: 'טיב טעם', id: 'tiv-taam', logo_url: STORE_LOGOS['טיב טעם'] },
  { name: 'קרפור', id: 'carrefour', logo_url: STORE_LOGOS['קרפור'] },
  { name: 'קשת טעמים', id: 'keshet-teamim', logo_url: STORE_LOGOS['קשת טעמים'] },
  { name: 'סופר יהודה', id: 'super-yehuda', logo_url: STORE_LOGOS['סופר יהודה'] },
  { name: 'פרש מרקט', id: 'fresh-market', logo_url: STORE_LOGOS['פרש מרקט'] },
  { name: 'זול ובגדול', id: 'zol-vbgadol', logo_url: STORE_LOGOS['זול ובגדול'] },
  { name: 'משנת יוסף', id: 'mishnat-yosef', logo_url: STORE_LOGOS['משנת יוסף'] },
  { name: 'קינג סטור', id: 'king-store', logo_url: STORE_LOGOS['קינג סטור'] },
  { name: 'נתיב החסד', id: 'netiv-hachesed', logo_url: null }
];

export interface StoreChain {
  name: string;
  id: string;
  logo_url?: string | null;
  key?: string;
}

export async function fetchStoreChains() {
  try {
    console.log('Fetching store chains from database...');
    
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
      
      const formattedStores = storeChains.map(store => {
        const normalizedName = normalizeChainName(store.name);
        
        // Use our predefined logos instead of the database ones
        const logoUrl = STORE_LOGOS[normalizedName] || null;
        
        return {
          name: normalizedName,
          id: store.id,
          logo_url: logoUrl
        };
      });
      
      console.log('Formatted store chains:', formattedStores);
      return formattedStores;
    }
    
    console.log('No data in store_chains, falling back to store_products');
    const { data, error } = await supabase
      .from('store_products')
      .select('store_chain')
      .order('store_chain')
      .not('store_chain', 'is', null);

    if (error) {
      console.error('Error fetching from store_products:', error);
      return fallbackStoreChains;
    }

    const uniqueStores = Array.from(new Set(data.map(item => item.store_chain)));
    
    const storesFromDB = uniqueStores.map(storeName => {
      const normalizedName = normalizeChainName(storeName);
      
      // Use our predefined logos
      const logoUrl = STORE_LOGOS[normalizedName] || null;
      
      return {
        name: normalizedName,
        id: normalizedName.toLowerCase().replace(/\s+/g, '-'),
        logo_url: logoUrl
      };
    });
    
    return storesFromDB.sort((a, b) => a.name.localeCompare(b.name, 'he'));
  } catch (error) {
    console.error('Error in fetchStoreChains:', error);
    return fallbackStoreChains;
  }
}
