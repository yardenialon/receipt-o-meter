
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
          {storeChains.map((store) => (
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
