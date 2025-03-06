
import { supabase } from '@/lib/supabase';
import { normalizeChainName } from '@/utils/shopping/storeNameUtils';

// Known available logos with direct paths
const CONFIRMED_LOGOS: Record<string, string> = {
  'שופרסל': '/public/lovable-uploads/7f874da2-c327-4a3b-aec1-53f8a0b28a1c.png', // Updated path
  'טיב טעם': '/public/lovable-uploads/bee996f5-ef8f-434b-8d0b-04e7b6ce37b9.png' // Updated path
};

// Fallback store chains with standardized paths using chain-id based naming convention
export const fallbackStoreChains = [
  { name: 'רמי לוי', id: 'rami-levy', logo_url: null },
  { name: 'שופרסל', id: 'shufersal', logo_url: CONFIRMED_LOGOS['שופרסל'] },
  { name: 'יינות ביתן', id: 'yeinot-bitan', logo_url: null },
  { name: 'ויקטורי', id: 'victory', logo_url: null },
  { name: 'יוחננוף', id: 'yochananof', logo_url: null },
  { name: 'מחסני השוק', id: 'machsanei-hashuk', logo_url: null },
  { name: 'אושר עד', id: 'osher-ad', logo_url: null },
  { name: 'חצי חינם', id: 'hatzi-hinam', logo_url: null },
  { name: 'סופר פארם', id: 'super-pharm', logo_url: null },
  { name: 'טיב טעם', id: 'tiv-taam', logo_url: CONFIRMED_LOGOS['טיב טעם'] },
  { name: 'קרפור', id: 'carrefour', logo_url: null },
  { name: 'קשת טעמים', id: 'keshet-teamim', logo_url: null },
  { name: 'סופר יהודה', id: 'super-yehuda', logo_url: null },
  { name: 'פרש מרקט', id: 'fresh-market', logo_url: null },
  { name: 'פוליצר', id: 'politzer', logo_url: null },
  { name: 'ברקת', id: 'bareket', logo_url: null },
  { name: 'שוק העיר', id: 'shuk-hair', logo_url: null },
  { name: 'סופר ספיר', id: 'super-sapir', logo_url: null },
  { name: 'סיטי מרקט', id: 'city-market', logo_url: null },
  { name: 'גוד פארם', id: 'good-pharm', logo_url: null },
  { name: 'סטופ מרקט', id: 'stop-market', logo_url: null },
  { name: 'היפר כהן', id: 'hyper-cohen', logo_url: null },
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
        
        // Only use confirmed logos and actual uploaded files
        // Don't construct dynamic file paths that might not exist
        let logoUrl = CONFIRMED_LOGOS[normalizedName] || null;
        
        // Only use DB logo if it has a full path and looks like an actual file
        if (!logoUrl && store.logo_url && 
            (store.logo_url.startsWith('/lovable-uploads/') || 
             store.logo_url.startsWith('http'))) {
          logoUrl = store.logo_url;
        }
        
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
      
      // Only use confirmed logos
      const logoUrl = CONFIRMED_LOGOS[normalizedName] || null;
      
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
