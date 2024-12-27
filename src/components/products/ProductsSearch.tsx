import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProductsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ProductsSearch = ({ searchTerm, onSearchChange }: ProductsSearchProps) => {
  return (
    <div className="relative mb-6">
      <Input
        type="text"
        placeholder="חפש לפי שם מוצר, קטגוריה או קוד מוצר..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
      <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
    </div>
  );
};