import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface StoreChainInfo {
  store_chain: string;
  store_ids: string[];
}

export const ProductsStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['products-stats'],
    queryFn: async () => {
      // Get total products count
      const { count: totalProducts } = await supabase
        .from('store_products')
        .select('*', { count: 'exact', head: true });

      // Get unique store chains with their branches
      const { data: storeChains } = await supabase
        .from('store_products')
        .select('store_chain, store_id')
        .not('store_id', 'is', null);

      // Process store chains data
      const chainMap = new Map<string, Set<string>>();
      storeChains?.forEach(product => {
        if (!chainMap.has(product.store_chain)) {
          chainMap.set(product.store_chain, new Set());
        }
        if (product.store_id) {
          chainMap.get(product.store_chain)?.add(product.store_id);
        }
      });

      const processedChains: StoreChainInfo[] = Array.from(chainMap.entries()).map(([chain, stores]) => ({
        store_chain: chain,
        store_ids: Array.from(stores)
      }));

      return {
        totalProducts: totalProducts || 0,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">סה״כ מוצרים</h3>
          <p className="text-2xl font-bold text-blue-600">{stats?.totalProducts}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">רשתות</h3>
          <p className="text-2xl font-bold text-green-600">{stats?.storeChains.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">פירוט רשתות וסניפים</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats?.storeChains.map((chain) => (
            <div key={chain.store_chain} className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-700">{chain.store_chain}</h4>
              <div className="mt-2 space-y-1">
                {chain.store_ids.map((storeId) => (
                  <p key={storeId} className="text-sm text-purple-600">
                    סניף: {storeId}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};