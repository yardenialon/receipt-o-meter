
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

export const useShoppingLists = () => {
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
    onError: (error) => {
      console.error('Error creating list:', error);
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
    onError: (error) => {
      console.error('Error deleting list:', error);
      toast.error('אירעה שגיאה במחיקת הרשימה');
    },
  });

  return {
    lists,
    isLoading,
    createList,
    deleteList
  };
};
