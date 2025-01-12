import { Store, MapPin } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface StorePriceProps {
  store: {
    store_chain: string;
    store_id: string | null;
    store_name?: string | null;
    store_address: string | null;
    price: number;
    price_update_date: string;
  };
  isLowestPrice: boolean;
  priceDiff: string | null;
}

export const StorePrice = ({ store, isLowestPrice, priceDiff }: StorePriceProps) => {
  return (
    <div 
      className={`flex justify-between items-start p-2 rounded ${
        isLowestPrice ? 'bg-green-50 border border-green-100' : 'bg-white border'
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant={isLowestPrice ? "default" : "secondary"}>
            <Store className="h-3 w-3 ml-1" />
            {store.store_chain}
          </Badge>
        </div>
        
        {store.store_name && (
          <div className="text-sm font-medium">
            {store.store_name}
          </div>
        )}
        
        {store.store_address && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {store.store_address}
          </div>
        )}
        
        {store.price_update_date && (
          <div className="text-sm text-muted-foreground">
            עודכן: {format(new Date(store.price_update_date), 'dd/MM/yyyy', { locale: he })}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${
          isLowestPrice ? 'text-green-600' : ''
        }`}>
          ₪{store.price.toFixed(2)}
        </span>
        {!isLowestPrice && priceDiff && (
          <span className="text-sm text-muted-foreground">
            (+{priceDiff}%)
          </span>
        )}
      </div>
    </div>
  );
};