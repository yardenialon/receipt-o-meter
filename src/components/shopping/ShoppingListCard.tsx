import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Scale } from 'lucide-react';
import { useState } from 'react';
import { ShoppingListPriceComparison } from './PriceComparison';
import { useShoppingListPrices } from '@/hooks/useShoppingListPrices';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
    <Card className="p-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {list.name}
          </h2>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowComparison(!showComparison)}
              className="gap-2"
            >
              <Scale className="h-4 w-4" />
              השוואת מחירים
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                  <AlertDialogDescription>
                    פעולה זו תמחק את רשימת הקניות לצמיתות ולא ניתן יהיה לשחזר אותה.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDeleteList(list.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    מחק רשימה
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {showComparison && (
        <div className="mb-4">
          {isLoading ? (
            <div className="text-center p-4">טוען השוואת מחירים...</div>
          ) : (
            <ShoppingListPriceComparison comparisons={priceComparisons || []} />
          )}
        </div>
      )}

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