import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { ShoppingListPriceComparison } from './PriceComparison';
import { useShoppingListPrices } from '@/hooks/useShoppingListPrices';
import { ShoppingListItem } from './ShoppingListItem';
import { ShoppingListHeader } from './ShoppingListHeader';
import { AnimatePresence } from 'framer-motion';

interface ShoppingListCardProps {
  list: {
    id: string;
    name: string;
    shopping_list_items: Array<{
      id: string;
      name: string;
      is_completed: boolean;
    }>;
  };
  onToggleItem: (id: string, isCompleted: boolean) => void;
  onDeleteItem: (id: string) => void;
  onDeleteList: (id: string) => void;
}

export const ShoppingListCard = ({ 
  list, 
  onToggleItem, 
  onDeleteItem,
  onDeleteList
}: ShoppingListCardProps) => {
  const [showComparison, setShowComparison] = useState(false);
  const { data: priceComparisons, isLoading } = useShoppingListPrices(list.shopping_list_items);

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm border-primary-100/20">
      <ShoppingListHeader 
        name={list.name}
        onToggleComparison={() => setShowComparison(!showComparison)}
        onDeleteList={onDeleteList}
        listId={list.id}
      />

      {showComparison && (
        <div className="mb-6 animate-fade-in">
          {isLoading ? (
            <div className="text-center p-4 text-gray-500">טוען השוואת מחירים...</div>
          ) : (
            <ShoppingListPriceComparison comparisons={priceComparisons || []} />
          )}
        </div>
      )}

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-2">
          <AnimatePresence>
            {list.shopping_list_items?.map((item) => (
              <ShoppingListItem
                key={item.id}
                item={item}
                onToggle={onToggleItem}
                onDelete={onDeleteItem}
              />
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </Card>
  );
};