import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStoreChains, fallbackStoreChains } from '@/components/logos/utils/storeChainUtils';
import { StoreLogo } from '@/components/shopping/comparison/StoreLogo';

export function AutoLogoSlider() {
  const { data: storeChains = fallbackStoreChains } = useQuery({
    queryKey: ['store-chains-logos'],
    queryFn: fetchStoreChains,
    staleTime: 5 * 60 * 1000,
  });

  // Filter stores that have logos
  const filteredStores = useMemo(() => {
    return storeChains.filter(store => {
      const normalizedName = store.name.toLowerCase().trim();
      return (
        normalizedName.includes('רמי לוי') || 
        normalizedName.includes('carrefour') || normalizedName.includes('קרפור') ||
        normalizedName.includes('shufersal') || normalizedName.includes('שופרסל') ||
        normalizedName.includes('machsanei') || normalizedName.includes('מחסני השוק') ||
        normalizedName.includes('victory') || normalizedName.includes('ויקטורי') ||
        normalizedName.includes('yochananof') || normalizedName.includes('יוחננוף') ||
        normalizedName.includes('אושר עד') || normalizedName.includes('osher ad') ||
        normalizedName.includes('חצי חינם') || normalizedName.includes('hatzi hinam') ||
        normalizedName.includes('קשת טעמים') || normalizedName.includes('keshet teamim') ||
        normalizedName.includes('סופר יהודה') || normalizedName.includes('super yehuda') ||
        normalizedName.includes('פרש מרקט') || normalizedName.includes('fresh market') ||
        normalizedName.includes('פוליצר') || normalizedName.includes('politzer') ||
        normalizedName.includes('ברקת') || normalizedName.includes('bareket') || normalizedName.includes('barkat') ||
        normalizedName.includes('שוק העיר') || normalizedName.includes('shuk hair') || normalizedName.includes('city market') ||
        normalizedName.includes('סופר ספיר') || normalizedName.includes('super sapir') ||
        normalizedName.includes('סיטי מרקט') || normalizedName.includes('city market 24/7') ||
        normalizedName.includes('היפר כהן') || normalizedName.includes('hyper cohen') ||
        normalizedName.includes('טיב טעם') || normalizedName.includes('tiv taam') ||
        normalizedName.includes('זול ובגדול') || normalizedName.includes('zol vegadol') ||
        normalizedName.includes('משנת יוסף') || normalizedName.includes('mishnat yosef') ||
        normalizedName.includes('קינג סטור') || normalizedName.includes('king store') ||
        normalizedName.includes('נתיב החסד') || normalizedName.includes('netiv hachesed') ||
        normalizedName.includes('סטופ מרקט') || normalizedName.includes('stop market')
      );
    });
  }, [storeChains]);

  if (filteredStores.length === 0) {
    return (
      <div className="py-6">
        <div className="flex justify-center">
          <div className="animate-pulse">טוען...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div 
        className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        
        {filteredStores.map((store) => (
          <div 
            key={store.id}
            className="flex-shrink-0 flex flex-col items-center justify-center group cursor-pointer"
          >
            <div className="h-32 w-32 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-sm border p-2 flex items-center justify-center transition-all group-hover:scale-105 hover:shadow-md h-full w-full">
                <StoreLogo 
                  storeName={store.name} 
                  className="h-20 max-w-full object-contain" 
                />
              </div>
            </div>
            <span className="mt-1 text-xs text-center text-gray-700 truncate max-w-[90%] w-32">
              {store.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}