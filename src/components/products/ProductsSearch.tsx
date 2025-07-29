
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { SearchResults } from './SearchResults';
import { supabase } from '@/lib/supabase';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';

interface ProductsSearchProps {
  onSearch: (searchTerm: string) => void;
  onProductSelect?: (product: { name: string; product_code?: string | null }) => void;
  placeholder?: string;
  className?: string;
}

export const ProductsSearch = ({ 
  onSearch, 
  onProductSelect,
  placeholder = "חפש מוצר...",
  className = ""
}: ProductsSearchProps) => {
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
        .or(`product_name.ilike.%${debouncedSearch}%,product_code.ilike.%${debouncedSearch}%`)
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
      // וודא שיש שם מוצר
      const productName = product.product_name || "מוצר ללא שם";
      
      onProductSelect({
        name: productName,
        product_code: product.product_code
      });
    }
  };

  return (
    <div className="relative">
      <Input
        type="search"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={className}
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
