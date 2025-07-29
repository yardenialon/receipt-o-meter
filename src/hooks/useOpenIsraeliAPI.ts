
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ChainData {
  id: string;
  name: string;
  logo_url?: string;
}

export interface StoreData {
  id: string;
  chain_id: string;
  name: string;
  address: string;
  city: string;
  type: string;
}

export interface ProductSearchResult {
  code: string;
  name: string;
  manufacturer: string;
  price?: number;
  store_id?: string;
  chain_id?: string;
}

export interface ProductPrice {
  product_code: string;
  chain_id: string;
  store_id: string;
  price: number;
  update_date: string;
}

export const useOpenIsraeliAPI = () => {
  const queryClient = useQueryClient();

  // Fetch all supermarket chains
  const useChains = () => {
    return useQuery({
      queryKey: ['open-israeli-chains'],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke('fetch-open-israeli-prices', {
          body: { action: 'listChains' }
        });

        if (error) {
          console.error('Error fetching chains:', error);
          toast.error('שגיאה בטעינת רשתות השיווק');
          throw error;
        }

        return data as ChainData[];
      },
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
    });
  };

  // Fetch stores by chain ID
  const useStores = (chainId?: string) => {
    return useQuery({
      queryKey: ['open-israeli-stores', chainId],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke('fetch-open-israeli-prices', {
          body: { 
            action: 'listStores',
            params: { chainId }
          }
        });

        if (error) {
          console.error('Error fetching stores:', error);
          toast.error('שגיאה בטעינת סניפים');
          throw error;
        }

        return data as StoreData[];
      },
      enabled: !!chainId,
      staleTime: 60 * 60 * 1000, // 1 hour
    });
  };

  // Search products by query string
  const useProductSearch = (query: string, chainId?: string, storeId?: string) => {
    return useQuery({
      queryKey: ['open-israeli-product-search', query, chainId, storeId],
      queryFn: async () => {
        if (!query || query.length < 2) return [];

        const { data, error } = await supabase.functions.invoke('fetch-open-israeli-prices', {
          body: { 
            action: 'searchProducts',
            params: { 
              query,
              chainId,
              storeId
            }
          }
        });

        if (error) {
          console.error('Error searching products:', error);
          toast.error('שגיאה בחיפוש מוצרים');
          throw error;
        }

        return data as ProductSearchResult[];
      },
      enabled: query.length >= 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get product prices across chains/stores
  const useProductPrices = (productCode: string, chainIds?: string[], storeIds?: string[]) => {
    return useQuery({
      queryKey: ['open-israeli-product-prices', productCode, chainIds, storeIds],
      queryFn: async () => {
        if (!productCode) return [];

        const { data, error } = await supabase.functions.invoke('fetch-open-israeli-prices', {
          body: { 
            action: 'getProductPrices',
            params: { 
              productCode,
              chainIds,
              storeIds
            }
          }
        });

        if (error) {
          console.error('Error fetching product prices:', error);
          toast.error('שגיאה בטעינת מחירי מוצר');
          throw error;
        }

        return data as ProductPrice[];
      },
      enabled: !!productCode,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Update local shopping list with product from API
  const useAddProductToList = () => {
    return useMutation({
      mutationFn: async ({ 
        listId, 
        product 
      }: { 
        listId: string; 
        product: ProductSearchResult 
      }) => {
        const { error } = await supabase
          .from('shopping_list_items')
          .insert([{ 
            list_id: listId,
            name: product.name,
            product_code: product.code
          }]);

        if (error) {
          console.error('Error adding product to list:', error);
          toast.error('שגיאה בהוספת מוצר לרשימה');
          throw error;
        }

        return { success: true };
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
        toast.success('המוצר נוסף לרשימה בהצלחה');
      }
    });
  };

  return {
    useChains,
    useStores,
    useProductSearch,
    useProductPrices,
    useAddProductToList
  };
};
