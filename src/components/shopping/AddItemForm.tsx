import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddItemFormProps {
  onAddItem: (listId: string, name: string) => void;
  listId: string;
}

export const AddItemForm = ({ onAddItem, listId }: AddItemFormProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");

  const { data: products } = useQuery({
    queryKey: ['products-search', search],
    queryFn: async () => {
      if (!search) return [];
      
      const { data } = await supabase
        .from('store_products')
        .select('product_name')
        .ilike('product_name', `%${search}%`)
        .limit(10);
      
      return data?.map(p => p.product_name) || [];
    },
    enabled: search.length > 0
  });

  const handleSelect = (currentValue: string) => {
    setValue(currentValue);
    setOpen(false);
    onAddItem(listId, currentValue);
    setValue("");
    setSearch("");
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex-1 justify-between"
          >
            {value || "הוסף פריט חדש..."}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput 
              placeholder="חפש מוצר..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandEmpty>לא נמצאו תוצאות</CommandEmpty>
            <CommandGroup>
              {products?.map((product) => (
                <CommandItem
                  key={product}
                  value={product}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === product ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {product}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <Button 
        onClick={() => {
          if (value) {
            onAddItem(listId, value);
            setValue("");
            setSearch("");
          }
        }}
      >
        הוסף
      </Button>
    </div>
  );
};