import { Card } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useShoppingListPrices } from '@/hooks/useShoppingListPrices';
import { ShoppingListPriceComparison } from '@/components/shopping/PriceComparison';
import { ShoppingListCard } from '@/components/shopping/ShoppingListCard';
import { Button } from '@/components/ui/button';
import { ListPlus } from 'lucide-react';

export default function ShoppingList() {
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

  const deleteList = useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      toast.success('הרשימה נמחקה בהצלחה');
    },
    onError: () => {
      toast.error('אירעה שגיאה במחיקת הרשימה');
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
            <ShoppingListCard
              key={list.id}
              list={list}
              onAddItem={(listId, name) => addItem.mutate({ listId, name })}
              onToggleItem={(id, isCompleted) => toggleItem.mutate({ id, isCompleted })}
              onDeleteItem={(id) => deleteItem.mutate(id)}
              onDeleteList={(id) => deleteList.mutate(id)}
            />
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