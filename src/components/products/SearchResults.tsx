import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Store, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PriceComparison } from './PriceComparison';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface SearchResult {
  product_code?: string;
  product_name?: string;
  price?: number;
  price_update_date?: string;
  store_chain?: string;
  store_id?: string;
  store_name?: string;
  store_address?: string;
  manufacturer?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
  onSelect?: (result: SearchResult) => void;
}

export const SearchResults = ({ results, isLoading, onSelect }: SearchResultsProps) => {
  // Fetch store information for each result
  const { data: storeInfo } = useQuery({
    queryKey: ['store-branches', results.map(r => `${r.store_chain}-${r.store_id}`).join(',')],
    queryFn: async () => {
      if (!results.length) return {};
      
      const { data: branches } = await supabase
        .from('store_branches')
        .select('chain_id, branch_id, name, address')
        .in('branch_id', results.map(r => r.store_id || ''));
      
      return branches?.reduce((acc, branch) => {
        acc[branch.branch_id] = branch;
        return acc;
      }, {}) || {};
    },
    enabled: results.length > 0
  });

  // Group results by product_code to show comparisons
  const groupedResults = results.reduce((acc, result) => {
    if (!result.product_code) return acc;
    if (!acc[result.product_code]) {
      acc[result.product_code] = [];
    }
    
    // Add store information to the result
    const branchInfo = storeInfo?.[result.store_id || ''];
    const enrichedResult = {
      ...result,
      store_name: branchInfo?.name || null,
      store_address: branchInfo?.address || null
    };
    
    acc[result.product_code].push(enrichedResult);
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
          store_id: item.store_id || '',
          store_name: item.store_name || null,
          store_address: item.store_address || null,
          price: item.price || 0,
          price_update_date: item.price_update_date || new Date().toISOString()
        }));

        return (
          <div
            key={itemCode}
            className="p-3 hover:bg-gray-50 border-b last:border-b-0"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="space-y-1">
                <div className="font-medium">{mainItem.product_name}</div>
                {mainItem.price_update_date && (
                  <div className="text-sm text-muted-foreground">
                    עודכן: {format(new Date(mainItem.price_update_date), 'dd/MM/yyyy', { locale: he })}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  מק״ט: {mainItem.product_code}
                </div>
                {mainItem.manufacturer && (
                  <div className="text-sm text-muted-foreground">
                    יצרן: {mainItem.manufacturer}
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelect?.(mainItem)}
                className="shrink-0"
              >
                <Plus className="h-4 w-4 ml-2" />
                הוסף לרשימה
              </Button>
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