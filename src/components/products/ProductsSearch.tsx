import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { SearchResults } from './SearchResults';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import debounce from 'lodash/debounce';

interface ProductsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ProductsSearch = ({ searchTerm, onSearchChange }: ProductsSearchProps) => {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['products-search', debouncedTerm],
    queryFn: async () => {
      if (!debouncedTerm) return [];

      console.log('Searching for:', debouncedTerm);
      
      const { data } = await supabase
        .from('store_products_import')
        .select('ItemCode,ItemName,ItemPrice,store_chain,store_id,ManufacturerName')
        .or(`ItemName.ilike.%${debouncedTerm}%,ItemCode.ilike.%${debouncedTerm}%`)
        .limit(50);
      
      console.log('Search results:', data);
      return data || [];
    },
    enabled: debouncedTerm.length > 0
  });

  // Debounce the search to avoid too many requests
  const debouncedSearch = debounce((term: string) => {
    setDebouncedTerm(term);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
    debouncedSearch(value);
  };

  return (
    <div className="relative">
      <Input
        type="search"
        placeholder="חפש מוצר לפי שם או ברקוד..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full"
      />
      {searchTerm && <SearchResults results={results} isLoading={isLoading} />}
    </div>
  );
};