import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SearchResults } from "./SearchResults";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface ProductsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ProductsSearch = ({ searchTerm, onSearchChange }: ProductsSearchProps) => {
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['product-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data } = await supabase
        .from('store_products_import')
        .select('*')
        .or(`ItemName.ilike.%${searchTerm}%,ItemCode.ilike.%${searchTerm}%`)
        .limit(5);
      
      return data || [];
    },
    enabled: searchTerm.length >= 2
  });

  return (
    <div className="relative space-y-2">
      <div className="relative">
        <Input
          type="text"
          placeholder="חפש לפי שם מוצר, קטגוריה או קוד מוצר..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
      </div>
      
      {searchTerm.length >= 2 && (
        <SearchResults results={searchResults || []} isLoading={isLoading} />
      )}
    </div>
  );
};