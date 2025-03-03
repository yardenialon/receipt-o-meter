
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useShoppingListItems = () => {
  const queryClient = useQueryClient();

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
      // גם עדכון מחירים כשסימון משתנה
      queryClient.invalidateQueries({ queryKey: ['shopping-list-prices'] });
    },
    onError: (error) => {
      console.error('Error toggling item:', error);
      toast.error('אירעה שגיאה בעדכון הפריט');
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
      queryClient.invalidateQueries({ queryKey: ['shopping-list-prices'] });
      toast.success('פריט נמחק בהצלחה');
    },
    onError: (error) => {
      console.error('Error deleting item:', error);
      toast.error('אירעה שגיאה במחיקת הפריט');
    },
  });

  const addItem = useMutation({
    mutationFn: async ({ 
      listId, 
      name, 
      productCode 
    }: { 
      listId: string; 
      name: string;
      productCode?: string | null
    }) => {
      console.log('Adding item:', { listId, name, productCode });
      
      const item = {
        list_id: listId,
        name: name,
        product_code: productCode || null,
        is_completed: false
      };
      
      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert([item])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error adding item:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      queryClient.invalidateQueries({ queryKey: ['shopping-list-prices'] });
      toast.success('פריט נוסף בהצלחה');
    },
    onError: (error) => {
      console.error('Error adding item:', error);
      toast.error('אירעה שגיאה בהוספת הפריט');
    },
  });

  return {
    toggleItem,
    deleteItem,
    addItem
  };
};
