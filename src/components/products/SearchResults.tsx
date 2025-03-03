
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Store, Plus, MapPin } from 'lucide-react';
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
  const { data: branchInfo } = useQuery({
    queryKey: ['branch-mappings', results.map(r => `${r.store_chain}-${r.store_id}`).join(',')],
    queryFn: async () => {
      if (!results.length) return {};
      
      const { data: mappings } = await supabase
        .from('branch_mappings')
        .select('id, source_chain, source_branch_id, source_branch_name, branch_id');

      if (!mappings) return {};

      const branchIds = mappings.map(m => m.branch_id).filter(Boolean);
      const { data: branches } = await supabase
        .from('store_branches')
        .select(`
          id,
          name,
          address,
          chain_id,
          store_chains (
            id,
            name
          )
        `)
        .in('id', branchIds);

      return mappings.reduce((acc, mapping) => {
        const key = `${mapping.source_chain}-${mapping.source_branch_id}`;
        const branch = branches?.find(b => b.id === mapping.branch_id);
        
        acc[key] = {
          branchName: branch?.name || mapping.source_branch_name || '',
          branchAddress: branch?.address || '',
          chainName: branch?.store_chains?.name || mapping.source_chain
        };
        return acc;
      }, {} as Record<string, { branchName: string; branchAddress: string; chainName: string; }>);
    },
    enabled: results.length > 0
  });

  const groupedResults = results.reduce((acc, result) => {
    if (!result.product_code) return acc;
    if (!acc[result.product_code]) {
      acc[result.product_code] = [];
    }
    
    const lookupKey = `${result.store_chain}-${result.store_id}`;
    const storeDetails = branchInfo?.[lookupKey] || {
      branchName: result.store_name || '',
      branchAddress: result.store_address || '',
      chainName: result.store_chain || ''
    };

    const enrichedResult = {
      ...result,
      store_chain: storeDetails.chainName,
      store_name: storeDetails.branchName,
      store_address: storeDetails.branchAddress
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
        const mainItem = items[0];
        
        // Create properly typed objects for PriceComparison
        const prices = items.map(item => ({
          product_code: item.product_code || '',
          product_name: item.product_name || '',
          manufacturer: item.manufacturer || '',
          store_chain: item.store_chain || '',
          store_id: item.store_id || '',
          store_name: item.store_name || '',
          store_address: item.store_address || '',
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
