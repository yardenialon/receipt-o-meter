import { useState, useMemo } from 'react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { calculateDistance, parseCoordinates } from '@/utils/distance';
import { StorePrice } from '@/components/shopping/comparison/StorePrice';
import { DistanceFilter } from '@/components/shopping/comparison/DistanceFilter';

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
  const [maxDistance, setMaxDistance] = useState<number>(20);
  
  const sortedPrices = useMemo(() => {
    if (!prices || prices.length === 0) {
      return [];
    }

    console.log('Raw prices:', prices);

    let pricesWithDistance = prices.map(price => {
      // נרמול שמות רשתות
      const normalizedChain = price.store_chain.toLowerCase().trim();
      let displayChain = price.store_chain;
      
      if (
        normalizedChain.includes('yochananof') || 
        normalizedChain.includes('יוחננוף') ||
        normalizedChain.includes('יוחנונוף') ||
        normalizedChain.includes('יוחננוב')
      ) {
        displayChain = 'יוחננוף';
      }

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
      return { ...price, distance, store_chain: displayChain };
    });

    if (location) {
      pricesWithDistance = pricesWithDistance.filter(price => 
        !price.distance || price.distance <= maxDistance
      );
    }

    return pricesWithDistance.sort((a, b) => {
      if (a.price !== b.price) return a.price - b.price;
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
      return 0;
    });
  }, [prices, location, maxDistance]);

  const lowestPrice = sortedPrices.length > 0 ? sortedPrices[0].price : null;
  
  if (!prices || prices.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        לא נמצאו מחירים למוצר זה
      </div>
    );
  }

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
        <DistanceFilter 
          maxDistance={maxDistance} 
          onDistanceChange={(value) => setMaxDistance(value)} 
        />
      )}
      
      <div className="space-y-2">
        {sortedPrices.map((price, index) => {
          const isLowestPrice = price.price === lowestPrice;
          const priceDiff = isLowestPrice ? null : 
            ((price.price - lowestPrice!) / lowestPrice! * 100).toFixed(1);
          
          return (
            <StorePrice
              key={`${price.store_chain}-${price.store_id}-${index}`}
              store={price}
              isLowestPrice={isLowestPrice}
              priceDiff={priceDiff}
            />
          );
        })}
      </div>
    </div>
  );
};