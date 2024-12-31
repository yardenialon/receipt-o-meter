import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  ItemCode?: string;
  ItemName?: string;
  ItemPrice?: number;
  PriceUpdateDate?: string;
  store_chain?: string;
  store_id?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  onSelect?: (result: SearchResult) => void;
}

export const SearchResults = ({ results, onSelect }: SearchResultsProps) => {
  if (!results.length) return null;

  return (
    <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border shadow-lg max-h-96 overflow-auto" dir="rtl">
      {results.map((result, index) => (
        <div
          key={`${result.ItemCode}-${index}`}
          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
          onClick={() => onSelect?.(result)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="font-medium">{result.ItemName}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="gap-1">
                  <Store className="h-3 w-3" />
                  {result.store_chain}
                  {result.store_id && ` (${result.store_id})`}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                מק״ט: {result.ItemCode}
              </div>
              {result.PriceUpdateDate && (
                <div className="text-xs text-muted-foreground">
                  עודכן: {format(new Date(result.PriceUpdateDate), 'dd/MM/yyyy', { locale: he })}
                </div>
              )}
            </div>
            <div className="text-lg font-semibold">
              ₪{result.ItemPrice?.toFixed(2)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};