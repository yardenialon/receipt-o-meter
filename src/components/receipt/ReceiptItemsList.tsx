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
  ItemPrice: number;
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

      const { data, error } = await supabase
        .from('store_products_import')
        .select('ItemCode, ItemPrice, store_chain, store_id')
        .in('ItemCode', productCodes);

      if (error) {
        console.error('Error fetching price comparisons:', error);
        return {};
      }

      // Group prices by product code
      return data.reduce((acc, item) => {
        if (!acc[item.ItemCode]) {
          acc[item.ItemCode] = [];
        }
        acc[item.ItemCode].push({
          ItemPrice: item.ItemPrice,
          store_chain: item.store_chain,
          store_id: item.store_id
        });
        return acc;
      }, {} as Record<string, PriceComparison[]>);
    },
    enabled: items.some(item => item.product_code)
  });

  return (
    <div className="space-y-4 mb-4">
      {items.map((item) => {
        // Find cheaper prices for this item if it has a product code
        let cheaperPrice: PriceComparison | null = null;
        if (item.product_code && priceComparisons?.[item.product_code]) {
          const prices = priceComparisons[item.product_code];
          const currentPrice = item.price / item.quantity; // Price per unit
          
          // Find the cheapest price from other stores
          cheaperPrice = prices
            .filter(p => p.store_chain !== storeName) // Exclude current store
            .sort((a, b) => a.ItemPrice - b.ItemPrice)
            .find(p => p.ItemPrice < currentPrice) || null;
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

            {cheaperPrice && (
              <Alert variant="warning" className="bg-amber-50 text-amber-900 border-amber-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  נמצא מחיר זול יותר ב{cheaperPrice.store_chain}
                  {cheaperPrice.store_id && ` (סניף ${cheaperPrice.store_id})`}:
                  <span className="font-bold mr-1">
                    ₪{cheaperPrice.ItemPrice.toFixed(2)}
                  </span>
                  <span className="text-xs">
                    (חיסכון של ₪{((item.price / item.quantity - cheaperPrice.ItemPrice) * item.quantity).toFixed(2)})
                  </span>
                </AlertDescription>
              </Alert>
            )}
          </div>
        );
      })}
    </div>
  );
};