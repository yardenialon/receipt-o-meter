
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReceiptItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  product_code?: string;
}

interface ReceiptItemsListProps {
  items: ReceiptItemProps[];
  storeName?: string;
}

interface PriceComparison {
  price: number;
  store_chain: string;
  store_id: string;
}

export const ReceiptItemsList = ({ items, storeName }: ReceiptItemsListProps) => {
  // Function to reverse the word order in Hebrew text
  const reverseHebrewText = (text: string) => {
    return text.split(' ').reverse().join(' ');
  };

  // Query to fetch price comparisons for items with product codes
  const { data: priceComparisons } = useQuery({
    queryKey: ['price-comparisons', items.map(item => item.product_code).filter(Boolean)],
    queryFn: async () => {
      const productCodes = items
        .map(item => item.product_code)
        .filter(Boolean);

      if (!productCodes.length) return {};

      console.log('Fetching price comparisons for product codes:', productCodes);
      console.log('Current store name:', storeName);

      const { data, error } = await supabase
        .from('store_products')
        .select('product_code, price, store_chain, store_id')
        .in('product_code', productCodes);

      if (error) {
        console.error('Error fetching price comparisons:', error);
        return {};
      }

      console.log('Raw price data from database:', data);

      // Group prices by product code
      const result = data.reduce((acc, item) => {
        if (!acc[item.product_code]) {
          acc[item.product_code] = [];
        }
        
        // נרמול שמות רשתות
        let normalizedStoreName = item.store_chain?.toLowerCase().trim();
        let displayName = item.store_chain;
        
        // יוחננוף וטוב טעם הם למעשה אותה רשת
        if (normalizedStoreName && 
            (normalizedStoreName.includes('יוחננוף') || 
             normalizedStoreName.includes('טוב טעם'))) {
          displayName = 'יוחננוף';
        }
        
        acc[item.product_code].push({
          price: item.price,
          store_chain: displayName || item.store_chain,
          store_id: item.store_id
        });
        
        return acc;
      }, {} as Record<string, PriceComparison[]>);
      
      console.log('Processed price comparisons:', result);
      
      return result;
    },
    enabled: items.some(item => item.product_code)
  });

  return (
    <div className="space-y-4 mb-4">
      {items.map((item) => {
        // Find cheaper prices for this item if it has a product code
        let cheaperPrices: PriceComparison[] = [];
        if (item.product_code && priceComparisons?.[item.product_code]) {
          const prices = priceComparisons[item.product_code];
          const currentPrice = item.price / item.quantity; // Price per unit
          
          // נרמל את שם החנות הנוכחית לצורך השוואה
          let normalizedCurrentStore = storeName?.toLowerCase().trim() || '';
          
          // מצא את כל המחירים הזולים יותר בחנויות אחרות
          cheaperPrices = prices
            .filter(p => {
              // נרמול שם החנות להשוואה
              const pStoreLower = p.store_chain.toLowerCase().trim();
              
              // אם החנות הנוכחית היא "יוחננוף" או "טוב טעם", נתייחס אליהן כאותה חנות
              if ((normalizedCurrentStore.includes('יוחננוף') || 
                   normalizedCurrentStore.includes('טוב טעם')) &&
                  (pStoreLower.includes('יוחננוף') || 
                   pStoreLower.includes('טוב טעם'))) {
                return false; // אותה רשת
              }
              
              // סינון רגיל - רק חנויות אחרות עם מחיר זול יותר
              return p.store_chain !== storeName && p.price < currentPrice;
            })
            .sort((a, b) => a.price - b.price); // מיון לפי מחיר עולה
        }

        return (
          <div key={item.id} className="space-y-2">
            <div className="flex justify-between text-sm p-2 rounded-lg hover:bg-primary-50 transition-colors">
              <div className="flex flex-col ml-2 flex-1">
                <span className="text-gray-700 truncate">
                  {reverseHebrewText(item.name)}
                </span>
                {item.product_code && (
                  <span className="text-xs text-gray-500">
                    מק"ט: {item.product_code}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.quantity > 1 && (
                  <span className="text-gray-500">x{item.quantity}</span>
                )}
                <span className="text-primary-600 font-medium">
                  ₪{item.price.toFixed(2)}
                </span>
              </div>
            </div>

            {cheaperPrices.length > 0 && cheaperPrices.map((cheaperPrice, index) => (
              <Alert 
                key={`${cheaperPrice.store_chain}-${cheaperPrice.store_id}-${index}`}
                variant="warning" 
                className="bg-amber-50 text-amber-900 border-amber-200 mb-2"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  נמצא מחיר זול יותר ב{cheaperPrice.store_chain}
                  {cheaperPrice.store_id && ` (סניף ${cheaperPrice.store_id})`}:
                  <span className="font-bold mr-1">
                    ₪{cheaperPrice.price.toFixed(2)}
                  </span>
                  <span className="text-xs">
                    (חיסכון של ₪{((item.price / item.quantity - cheaperPrice.price) * item.quantity).toFixed(2)})
                  </span>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        );
      })}
    </div>
  );
};
