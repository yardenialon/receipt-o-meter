import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AddItemForm } from './AddItemForm';

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
  onAddItem: (listId: string, name: string) => void;
  onToggleItem: (id: string, isCompleted: boolean) => void;
  onDeleteItem: (id: string) => void;
}

export const ShoppingListCard = ({ 
  list, 
  onAddItem, 
  onToggleItem, 
  onDeleteItem 
}: ShoppingListCardProps) => {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-4">
          {list.name}
        </h2>
        <AddItemForm
          listId={list.id}
          onAddItem={onAddItem}
        />
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-2">
          {list.shopping_list_items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 p-2 rounded hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={item.is_completed}
                  onCheckedChange={(checked) =>
                    onToggleItem(item.id, checked as boolean)
                  }
                />
                <span className={item.is_completed ? 'line-through text-muted-foreground' : ''}>
                  {item.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteItem(item.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};