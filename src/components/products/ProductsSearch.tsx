import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { SearchResults } from './SearchResults';
import { supabase } from '@/lib/supabase';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';

interface ProductsSearchProps {
  onProductSelect?: (product: any) => void;
}

export const ProductsSearch = ({ onProductSelect }: ProductsSearchProps) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['products-search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return [];

      const { data, error } = await supabase
        .from('store_products')
        .select(`
          product_code,
          product_name,
          price,
          price_update_date,
          store_chain,
          store_id,
          manufacturer
        `)
        .ilike('product_name', `%${debouncedSearch}%`)
        .limit(50);

      if (error) {
        console.error('Error searching products:', error);
        throw error;
      }

      return data || [];
    },
    enabled: debouncedSearch.length > 1
  });

  const handleProductSelect = (product: any) => {
    if (onProductSelect) {
      onProductSelect({
        name: product.product_name,
        product_code: product.product_code,
        // שמירת שדות נוספים אם נדרש
      });
    }
  };

  return (
    <div className="relative">
      <Input
        type="search"
        placeholder="חפש מוצר..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full"
        dir="rtl"
      />
      <SearchResults
        results={results}
        isLoading={isLoading}
        onSelect={handleProductSelect}
      />
    </div>
  );
};
