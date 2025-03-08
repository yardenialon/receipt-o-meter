
import { StoreLogo } from '@/components/shopping/comparison/StoreLogo';
import { StoreChain } from './utils/storeChainUtils';
import { normalizeChainName } from '@/utils/shopping/storeNameUtils';

interface LogoItemProps {
  store: StoreChain;
  visibleLogos: number;
}

export function LogoItem({ store, visibleLogos }: LogoItemProps) {
  // נרמול שם הרשת להצגה עקבית
  const normalizedName = normalizeChainName(store.name);
  
  return (
    <div 
      className="flex-shrink-0 flex flex-col items-center justify-center px-2"
      style={{ width: `${100 / visibleLogos}%` }}
    >
      <div className="h-16 w-16 mx-auto bg-white rounded-lg shadow-sm border p-2 flex items-center justify-center overflow-hidden">
        <StoreLogo 
          storeName={normalizedName} 
          className="h-12 w-12 object-contain"
          logoUrl={store.logo_url} 
        />
      </div>
      <span className="mt-2 text-sm text-center text-gray-700 truncate w-full">
        {normalizedName}
      </span>
    </div>
  );
}
