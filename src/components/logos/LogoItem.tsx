
import { StoreLogo } from '@/components/shopping/comparison/StoreLogo';
import { StoreChain } from './utils/storeChainUtils';

interface LogoItemProps {
  store: StoreChain;
  visibleLogos: number;
}

export function LogoItem({ store, visibleLogos }: LogoItemProps) {
  return (
    <div 
      className="flex-shrink-0 flex flex-col items-center justify-center"
      style={{ width: `${100 / visibleLogos}%` }}
    >
      <div className="h-16 w-full bg-white rounded-lg shadow-sm border p-2 flex items-center justify-center mx-2">
        <StoreLogo 
          storeName={store.name} 
          className="max-h-12 max-w-full object-contain" 
        />
      </div>
      <span className="mt-2 text-sm text-center text-gray-700 truncate w-full px-2">
        {store.name}
      </span>
    </div>
  );
}
