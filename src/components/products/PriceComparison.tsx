import { Store } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface StorePrice {
  store_chain: string;
  store_id: string | null;
  price: number;
  price_update_date: string;
}

interface PriceComparisonProps {
  prices: StorePrice[];
}

export const PriceComparison = ({ prices }: PriceComparisonProps) => {
  // Sort prices from lowest to highest
  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
  
  return (
    <div className="space-y-2">
      {sortedPrices.map((price, index) => (
        <div 
          key={`${price.store_chain}-${price.store_id}`}
          className={`flex justify-between items-center p-2 rounded ${
            index === 0 ? 'bg-red-50' : 'bg-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Store className="h-3 w-3" />
              {price.store_chain}
            </Badge>
            {price.store_id && (
              <Badge variant="outline">
                סניף {price.store_id}
              </Badge>
            )}
          </div>
          <span className={`font-semibold ${
            index === 0 ? 'text-red-600' : ''
          }`}>
            ₪{price.price.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
};