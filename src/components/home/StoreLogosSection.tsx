
import { useQuery } from '@tanstack/react-query';
import { fetchStoreChains, fallbackStoreChains } from '@/components/logos/utils/storeChainUtils';
import { StoreLogo } from '@/components/shopping/comparison/StoreLogo';

export function StoreLogosSection() {
  const { data: storeChains = fallbackStoreChains, isLoading } = useQuery({
    queryKey: ['store-chains-logos'],
    queryFn: fetchStoreChains,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="py-8 bg-gray-50 border-t border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center mb-2">
            <h2 className="text-xl font-bold text-gray-800 text-center">רשתות המזון המובילות</h2>
          </div>
          <p className="text-center text-gray-500 text-sm mb-4">מידע מעודכן מכל רשתות המזון במקום אחד</p>
          <div className="flex justify-center">
            <div className="animate-pulse">טוען...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gray-50 border-t border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center mb-2">
          <h2 className="text-xl font-bold text-gray-800 text-center">רשתות המזון המובילות</h2>
        </div>
        <p className="text-center text-gray-500 text-sm mb-4">מידע מעודכן מכל רשתות המזון במקום אחד</p>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 justify-items-center">
          {storeChains
            .filter(store => {
              // רק רשתות שיש להן לוגו
              const normalizedName = store.name.toLowerCase().trim();
              return (
                normalizedName.includes('רמי לוי') || 
                normalizedName.includes('carrefour') || normalizedName.includes('קרפור') ||
                normalizedName.includes('shufersal') || normalizedName.includes('שופרסל') ||
                normalizedName.includes('machsanei') || normalizedName.includes('מחסני השוק') ||
                normalizedName.includes('victory') || normalizedName.includes('ויקטורי') ||
                normalizedName.includes('yochananof') || normalizedName.includes('יוחננוף') ||
                normalizedName.includes('yeinot bitan') || normalizedName.includes('יינות ביתן') ||
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
            })
            .map((store) => (
            <div 
              key={store.id}
              className="flex flex-col items-center justify-center group cursor-pointer"
            >
              <div className="h-16 w-16 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-sm border p-2 flex items-center justify-center transition-all group-hover:scale-105 hover:shadow-md h-full w-full">
                  <StoreLogo 
                    storeName={store.name} 
                    className="h-10 max-w-full object-contain" 
                  />
                </div>
              </div>
              <span className="mt-1 text-xs text-center text-gray-700 truncate max-w-[90%]">
                {store.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
