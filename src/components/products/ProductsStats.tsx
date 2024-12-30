import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Building2 } from "lucide-react";

interface StoreChainInfo {
  store_chain: string;
  store_ids: string[];
}

export const ProductsStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['products-import-stats'],
    queryFn: async () => {
      // Get unique store chains with their branches from store_products_import table
      const { data: uniqueChains, error: chainsError } = await supabase
        .from('store_products_import')
        .select('store_chain')
        .not('store_chain', 'is', null)
        .or('store_chain.eq.שופרסל,store_chain.eq.ויקטורי,store_chain.eq.מחסני השוק,store_chain.eq.קרפור');

      if (chainsError) {
        console.error('Error fetching chains:', chainsError);
        throw chainsError;
      }

      // Get store chains with their branches
      const { data: storeChains, error: branchesError } = await supabase
        .from('store_products_import')
        .select('store_chain, store_id')
        .not('store_id', 'is', null)
        .or('store_chain.eq.שופרסל,store_chain.eq.ויקטורי,store_chain.eq.מחסני השוק,store_chain.eq.קרפור');

      if (branchesError) {
        console.error('Error fetching branches:', branchesError);
        throw branchesError;
      }

      // Process store chains data
      const chainMap = new Map<string, Set<string>>();
      storeChains?.forEach(product => {
        if (product.store_chain && !chainMap.has(product.store_chain)) {
          chainMap.set(product.store_chain, new Set());
        }
        if (product.store_chain && product.store_id) {
          chainMap.get(product.store_chain)?.add(product.store_id);
        }
      });

      const processedChains: StoreChainInfo[] = Array.from(chainMap.entries())
        .map(([chain, stores]) => ({
          store_chain: chain,
          store_ids: Array.from(stores)
        }))
        .sort((a, b) => a.store_chain.localeCompare(b.store_chain)); // Sort alphabetically

      // Ensure all chains are included even if they don't have branches yet
      const allChains = new Set(uniqueChains?.map(chain => chain.store_chain) || []);
      ['שופרסל', 'ויקטורי', 'מחסני השוק', 'קרפור'].forEach(chain => {
        if (!processedChains.some(pc => pc.store_chain === chain)) {
          processedChains.push({
            store_chain: chain,
            store_ids: []
          });
        }
      });

      return {
        totalUniqueChains: allChains.size || processedChains.length,
        storeChains: processedChains
      };
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div className="mb-6">
        <Card className="p-4 bg-blue-50">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">רשתות פעילות</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{stats?.totalUniqueChains || 0}</p>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Store className="h-5 w-5" />
          פירוט רשתות וסניפים
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats?.storeChains.map((chain) => (
            <Card key={chain.store_chain} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Store className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-purple-700">{chain.store_chain}</h4>
              </div>
              <div className="space-y-2">
                {chain.store_ids.length > 0 ? (
                  chain.store_ids.map((storeId) => (
                    <Badge 
                      key={storeId} 
                      variant="secondary" 
                      className="block w-fit"
                    >
                      סניף {storeId}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">אין סניפים זמינים כרגע</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};