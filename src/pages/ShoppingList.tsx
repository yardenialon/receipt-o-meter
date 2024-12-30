import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { ListPlus, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useShoppingListPrices } from '@/hooks/useShoppingListPrices';
import { ShoppingListPriceComparison } from '@/components/shopping/PriceComparison';

export default function ShoppingList() {
  const [newItem, setNewItem] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: lists, isLoading } = useQuery({
    queryKey: ['shopping-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*, shopping_list_items(*)');
      
      if (error) throw error;
      return data;
    },
  });

  // Get price comparisons for all active items across all lists
  const allItems = lists?.flatMap(list => list.shopping_list_items) || [];
  const { data: priceComparisons } = useShoppingListPrices(allItems);

  const createList = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in to create a list');
      
      const { data, error } = await supabase
        .from('shopping_lists')
        .insert([{ user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      toast.success('רשימה חדשה נוצרה בהצלחה');
    },
    onError: () => {
      toast.error('אירעה שגיאה ביצירת הרשימה');
    },
  });

  const addItem = useMutation({
    mutationFn: async ({ listId, name }: { listId: string; name: string }) => {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert([{ list_id: listId, name }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      setNewItem('');
      toast.success('פריט נוסף בהצלחה');
    },
    onError: () => {
      toast.error('אירעה שגיאה בהוספת הפריט');
    },
  });

  const toggleItem = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .update({ is_completed: isCompleted })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      toast.success('פריט נמחק בהצלחה');
    },
    onError: () => {
      toast.error('אירעה שגיאה במחיקת הפריט');
    },
  });

  const handleAddItem = (listId: string) => {
    if (!newItem.trim()) return;
    addItem.mutate({ listId, name: newItem });
  };

  if (isLoading) {
    return <div className="p-8">טוען...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">רשימות קניות</h1>
        <Button onClick={() => createList.mutate()}>
          <ListPlus className="h-5 w-5 ml-2" />
          רשימה חדשה
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          {lists?.map((list) => (
            <Card key={list.id} className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-4">
                  {list.name}
                </h2>
                <div className="flex gap-2">
                  <Input
                    placeholder="הוסף פריט חדש"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddItem(list.id);
                      }
                    }}
                  />
                  <Button onClick={() => handleAddItem(list.id)}>
                    הוסף
                  </Button>
                </div>
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
                            toggleItem.mutate({
                              id: item.id,
                              isCompleted: checked as boolean,
                            })
                          }
                        />
                        <span className={item.is_completed ? 'line-through text-muted-foreground' : ''}>
                          {item.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteItem.mutate(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          ))}
        </div>

        <div className="space-y-8">
          <Card className="p-6">
            <ShoppingListPriceComparison comparisons={priceComparisons || []} />
          </Card>
        </div>
      </div>
    </div>
  );
}