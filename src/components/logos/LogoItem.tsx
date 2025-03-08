
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
      <div className="h-16 w-full flex items-center justify-center group cursor-pointer">
        <div className="bg-white rounded-lg shadow-sm border p-2 flex items-center justify-center transition-transform group-hover:scale-105">
          <StoreLogo 
            storeName={store.name} 
            className="h-10 max-w-full object-contain" 
          />
        </div>
      </div>
      <span className="mt-1 text-xs md:text-sm text-center text-gray-700 truncate max-w-[90%]">
        {store.name}
      </span>
    </div>
  );
}
