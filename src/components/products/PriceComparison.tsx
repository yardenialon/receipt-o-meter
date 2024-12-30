import { Store } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

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
  const lowestPrice = sortedPrices[0]?.price;
  
  return (
    <div className="space-y-2">
      {sortedPrices.map((price, index) => {
        const isLowestPrice = price.price === lowestPrice;
        const priceDiff = isLowestPrice ? 0 : ((price.price - lowestPrice) / lowestPrice * 100).toFixed(1);
        
        return (
          <div 
            key={`${price.store_chain}-${price.store_id}-${index}`}
            className={`flex justify-between items-center p-2 rounded ${
              isLowestPrice ? 'bg-green-50 border border-green-100' : 'bg-white border'
            }`}
          >
            <div className="flex items-center gap-2">
              <Badge variant={isLowestPrice ? "default" : "secondary"} className="flex items-center gap-1">
                <Store className="h-3 w-3" />
                {price.store_chain}
              </Badge>
              {price.store_id && (
                <Badge variant="outline">
                  סניף {price.store_id}
                </Badge>
              )}
              {price.price_update_date && (
                <span className="text-sm text-muted-foreground">
                  עודכן: {format(new Date(price.price_update_date), 'dd/MM/yyyy', { locale: he })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${
                isLowestPrice ? 'text-green-600' : ''
              }`}>
                ₪{price.price.toFixed(2)}
              </span>
              {!isLowestPrice && (
                <span className="text-sm text-muted-foreground">
                  (+{priceDiff}%)
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};