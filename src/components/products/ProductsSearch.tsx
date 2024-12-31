import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { SearchResults } from './SearchResults';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import debounce from 'lodash/debounce';
import { Search } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';

interface ProductsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onProductSelect?: (product: any) => void;
}

export const ProductsSearch = ({ searchTerm, onSearchChange, onProductSelect }: ProductsSearchProps) => {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['products-search', debouncedTerm],
    queryFn: async () => {
      if (!debouncedTerm) return [];

      console.log('Searching for:', debouncedTerm);
      
      const { data } = await supabase
        .from('store_products_import')
        .select('ItemCode,ItemName,ItemPrice,store_chain,store_id,ManufacturerName,PriceUpdateDate')
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

  const handleProductSelect = (product: any) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  const handleBarcodeScanned = (barcode: string) => {
    console.log('Barcode scanned:', barcode);
    onSearchChange(barcode);
    setDebouncedTerm(barcode); // Trigger immediate search
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
          צור רשימת קניות חכמה
        </h2>
        <p className="text-muted-foreground">
          מצא את הסל המשתלם ביותר בסביבתך
        </p>
      </div>
      
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="search"
              placeholder="חפש מוצר לפי שם או ברקוד..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pr-10 pl-4 h-12 text-lg bg-white dark:bg-gray-900 border-2 border-primary/20 focus:border-primary/40 transition-all rounded-xl shadow-sm hover:shadow-md"
            />
          </div>
          <BarcodeScanner onScan={handleBarcodeScanned} />
        </div>
        {searchTerm && (
          <SearchResults 
            results={results} 
            isLoading={isLoading} 
            onSelect={handleProductSelect}
          />
        )}
      </div>
    </div>
  );
};