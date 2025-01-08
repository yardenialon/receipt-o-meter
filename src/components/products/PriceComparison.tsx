import { Store, MapPin } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useUserLocation } from '@/hooks/useUserLocation';
import { calculateDistance, parseCoordinates } from '@/utils/distance';
import { Slider } from "@/components/ui/slider";
import { useState, useMemo } from 'react';

interface StorePrice {
  store_chain: string;
  store_id: string | null;
  store_name?: string | null;
  store_address: string | null;
  price: number;
  price_update_date: string;
}

interface PriceComparisonProps {
  prices: StorePrice[];
}

export const PriceComparison = ({ prices }: PriceComparisonProps) => {
  const { location } = useUserLocation();
  const [maxDistance, setMaxDistance] = useState<number>(20); // 20km default radius
  
  const sortedPrices = useMemo(() => {
    let pricesWithDistance = prices.map(price => {
      let distance = null;
      if (location && price.store_address) {
        const storeCoords = parseCoordinates(price.store_address);
        if (storeCoords) {
          distance = calculateDistance(
            location.latitude,
            location.longitude,
            storeCoords.lat,
            storeCoords.lon
          );
        }
      }
      return { ...price, distance };
    });

    // Filter by distance if location is available
    if (location) {
      pricesWithDistance = pricesWithDistance.filter(
        price => price.distance === null || price.distance <= maxDistance
      );
    }

    // Sort by price first, then by distance if available
    return pricesWithDistance.sort((a, b) => {
      if (a.price !== b.price) return a.price - b.price;
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
      return 0;
    });
  }, [prices, location, maxDistance]);

  const lowestPrice = sortedPrices[0]?.price;
  
  if (sortedPrices.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        לא נמצאו חנויות במרחק המבוקש
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {location && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            מרחק מקסימלי: {maxDistance} ק"מ
          </label>
          <Slider
            value={[maxDistance]}
            onValueChange={(value) => setMaxDistance(value[0])}
            min={1}
            max={50}
            step={1}
          />
        </div>
      )}
      
      <div className="space-y-2">
        {sortedPrices.map((price, index) => {
          const isLowestPrice = price.price === lowestPrice;
          const priceDiff = isLowestPrice ? 0 : ((price.price - lowestPrice) / lowestPrice * 100).toFixed(1);
          
          return (
            <div 
              key={`${price.store_chain}-${price.store_id}-${index}`}
              className={`flex justify-between items-start p-2 rounded ${
                isLowestPrice ? 'bg-green-50 border border-green-100' : 'bg-white border'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={isLowestPrice ? "default" : "secondary"}>
                    <Store className="h-3 w-3 ml-1" />
                    {price.store_chain}
                  </Badge>
                </div>
                
                {price.store_name && (
                  <div className="text-sm font-medium">
                    {price.store_name}
                  </div>
                )}
                
                {price.store_address && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {price.store_address}
                    {price.distance !== null && (
                      <span>({price.distance.toFixed(1)} ק"מ)</span>
                    )}
                  </div>
                )}
                
                {price.price_update_date && (
                  <div className="text-sm text-muted-foreground">
                    עודכן: {format(new Date(price.price_update_date), 'dd/MM/yyyy', { locale: he })}
                  </div>
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
    </div>
  );
};