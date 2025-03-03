
import { useState } from 'react';
import { Search, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ProductsSearchBarProps {
  onSearch: (searchTerm: string) => void;
  onViewChange: (view: 'list' | 'grid') => void;
  currentView: 'list' | 'grid';
}

export const ProductsSearchBar = ({ onSearch, onViewChange, currentView }: ProductsSearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    // וודא שהחיפוש לא מבוצע עם מחרוזת ריקה כדי למנוע תוצאות מיותרות
    if (searchTerm.trim() !== '') {
      onSearch(searchTerm.trim());
    }
  };

  // מאזין לאירוע של לחיצה על Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="relative flex items-center">
        <Input
          type="search"
          placeholder="חפש לפי שם או מק״ט..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10"
          dir="rtl"
        />
        <Search className="absolute right-3 h-4 w-4 text-muted-foreground" />
        <Button 
          onClick={handleSearch} 
          className="mr-2"
          variant="secondary"
          disabled={searchTerm.trim() === ''}
        >
          חפש
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">תצוגת מוצרים:</span>
        <ToggleGroup 
          type="single" 
          value={currentView}
          onValueChange={(value) => {
            if (value) onViewChange(value as 'list' | 'grid');
          }}
        >
          <ToggleGroupItem value="list" aria-label="רשימה">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="גריד">
            <Grid className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};
