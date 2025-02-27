
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SearchResults } from './SearchResults';

interface ProductsSearchProps {
  onProductSelect?: (product: any) => void;
  placeholder?: string;
}

export const ProductsSearch = ({ 
  onProductSelect,
  placeholder = 'הוסף מוצר לרשימה...'
}: ProductsSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['product-search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) return [];

      console.log('Searching for products with term:', debouncedSearch);
      
      const { data, error } = await supabase
        .from('store_products')
        .select('id, product_name, product_code, price, store_chain')
        .ilike('product_name', `%${debouncedSearch}%`)
        .limit(20);
      
      if (error) {
        console.error('Error searching for products:', error);
        return [];
      }
      
      // קבץ תוצאות לפי קוד מוצר וקח את המחיר הנמוך ביותר
      const groupedResults: Record<string, any> = {};
      
      data.forEach(product => {
        const productCode = product.product_code;
        
        if (!groupedResults[productCode] || product.price < groupedResults[productCode].price) {
          groupedResults[productCode] = {
            id: product.id,
            product_code: productCode,
            product_name: product.product_name,
            price: product.price,
            store_chain: product.store_chain,
          };
        }
      });
      
      const results = Object.values(groupedResults);
      console.log('Grouped search results:', results);
      
      return results;
    },
    enabled: debouncedSearch.length >= 2,
  });

  useEffect(() => {
    setIsOpen(debouncedSearch.length >= 2);
  }, [debouncedSearch]);

  const handleProductSelect = (product: any) => {
    console.log('Product selected:', product);
    if (onProductSelect) {
      onProductSelect(product);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
          className="pl-10"
          dir="rtl"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      
      {isOpen && (
        <SearchResults
          results={searchResults || []}
          isLoading={isLoading}
          onSelect={handleProductSelect}
        />
      )}
    </div>
  );
};
