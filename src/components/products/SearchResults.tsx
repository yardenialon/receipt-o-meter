import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PriceComparison } from './PriceComparison';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface SearchResult {
  ItemCode?: string;
  ItemName?: string;
  ItemPrice?: number;
  PriceUpdateDate?: string;
  store_chain?: string;
  store_id?: string;
  ManufacturerName?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
  onSelect?: (result: SearchResult) => void;
}

export const SearchResults = ({ results, isLoading, onSelect }: SearchResultsProps) => {
  // Group results by ItemCode to show comparisons
  const groupedResults = results.reduce((acc, result) => {
    if (!result.ItemCode) return acc;
    if (!acc[result.ItemCode]) {
      acc[result.ItemCode] = [];
    }
    acc[result.ItemCode].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  if (isLoading) {
    return (
      <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border shadow-lg p-4" dir="rtl">
        <div className="text-center text-muted-foreground">טוען...</div>
      </div>
    );
  }

  if (!results.length) return null;

  return (
    <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border shadow-lg max-h-96 overflow-auto" dir="rtl">
      {Object.entries(groupedResults).map(([itemCode, items]) => {
        const mainItem = items[0]; // Use first item as the main display item
        
        // Format price data for comparison
        const prices = items.map(item => ({
          store_chain: item.store_chain || '',
          store_id: item.store_id || null,
          price: item.ItemPrice || 0,
          price_update_date: item.PriceUpdateDate || new Date().toISOString()
        }));

        return (
          <div
            key={itemCode}
            className="p-3 hover:bg-gray-50 border-b last:border-b-0"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="space-y-1">
                <div className="font-medium">{mainItem.ItemName}</div>
                <div className="text-xs text-muted-foreground">
                  מק״ט: {mainItem.ItemCode}
                </div>
                {mainItem.ManufacturerName && (
                  <div className="text-sm text-muted-foreground">
                    יצרן: {mainItem.ManufacturerName}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <PriceComparison prices={prices} />
            </div>
          </div>
        );
      })}
    </div>
  );
};