
import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { StoreLogo } from '../shopping/comparison/StoreLogo';
import { normalizeChainName } from '@/utils/shopping/storeNameUtils';

interface StoreProduct {
  product_code: string;
  product_name: string;
  manufacturer?: string;
  price: number;
  price_update_date: string;
  store_chain: string;
  store_id: string;
  store_name?: string;
  store_address?: string;
  logo_url?: string | null;
}

interface PriceComparisonProps {
  prices: StoreProduct[];
}

export const PriceComparison = ({ prices }: PriceComparisonProps) => {
  // Sort prices from lowest to highest
  const sortedPrices = useMemo(() => {
    return [...prices].sort((a, b) => a.price - b.price);
  }, [prices]);

  // Find the lowest and highest prices
  const lowestPrice = sortedPrices[0]?.price || 0;
  const highestPrice = sortedPrices[sortedPrices.length - 1]?.price || 0;
  
  // Calculate price difference percentage if possible
  const priceDiffPercent = lowestPrice && highestPrice 
    ? Math.round(((highestPrice - lowestPrice) / lowestPrice) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      {priceDiffPercent > 0 && (
        <div className="text-sm font-medium bg-yellow-50 text-yellow-800 rounded-md p-2 border border-yellow-200">
          קיים פער של עד {priceDiffPercent}% במחירי המוצר בין החנויות השונות
        </div>
      )}
      
      <div className="space-y-2">
        {sortedPrices.map((item, index) => {
          // Format the update date in a human-readable way
          let updateDateText = '';
          try {
            const updateDate = new Date(item.price_update_date);
            updateDateText = formatDistanceToNow(updateDate, { addSuffix: true, locale: he });
          } catch (e) {
            updateDateText = 'תאריך לא ידוע';
          }
          
          // Determine if this is the cheapest price
          const isCheapest = item.price === lowestPrice && sortedPrices.length > 1;
          
          // Normalize chain name for consistent display
          const normalizedChainName = normalizeChainName(item.store_chain);
          
          return (
            <div 
              key={`${item.store_chain}-${item.store_id}-${index}`}
              className={`flex items-center justify-between p-3 rounded-md border ${isCheapest ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="h-10 w-10 flex-shrink-0">
                  <StoreLogo 
                    storeName={normalizedChainName}
                    logoUrl={item.logo_url}
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <div>
                  <div className="font-medium">{normalizedChainName}</div>
                  <div className="text-sm text-gray-500">סניף: {item.store_id}</div>
                  <div className="text-xs text-gray-400">עדכון: {updateDateText}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold">₪{item.price.toFixed(2)}</div>
                {isCheapest && (
                  <div className="text-xs text-green-600 font-medium">המחיר הזול ביותר</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
