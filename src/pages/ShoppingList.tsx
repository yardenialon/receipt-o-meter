
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
import { ProductsSearch } from '@/components/products/ProductsSearch';
import { useState } from 'react';

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
  const { data: priceComparisons, isLoading: isLoadingPrices } = useShoppingListPrices(allItems);

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

  const handleAddProductToList = (listId: string, product: any) => {
    console.log('Product selected:', product);
    
    if (!product || !product.name && !product.product_name) {
      toast.error('נתוני מוצר חסרים');
      return;
    }
    
    addItem.mutate({
      listId,
      name: product.product_name || product.name, 
      productCode: product.product_code
    });
  };

  if (isLoading) {
    return <div className="p-8">טוען...</div>;
  }

  return (
    <div className="mx-auto md:container px-0 md:px-8 md:pb-8 pb-32">
      <div className="flex items-center justify-between mb-8 px-4 md:px-0">
        <h1 className="text-3xl font-bold">רשימות קניות</h1>
        <Button onClick={() => createList.mutate()}>
          <ListPlus className="h-5 w-5 ml-2" />
          רשימה חדשה
        </Button>
      </div>

      {/* שינוי היחס בין העמודות - רשימות קניות יקבלו 1/3 והשוואת מחירים תקבל 2/3 */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* עמודת רשימות קניות - עכשיו תופסת 1/3 */}
        <div className="space-y-8 px-4 md:px-0">
          {lists?.map((list) => (
            <div key={list.id} className="space-y-4">
              <div className="relative">
                <ProductsSearch
                  onProductSelect={(product) => handleAddProductToList(list.id, product)}
                />
              </div>
              <ShoppingListCard
                list={list}
                onToggleItem={(id, isCompleted) => toggleItem.mutate({ id, isCompleted })}
                onDeleteItem={(id) => deleteItem.mutate(id)}
                onDeleteList={(id) => deleteList.mutate(id)}
              />
            </div>
          ))}
        </div>

        {/* עמודת השוואת מחירים - עכשיו תופסת 2/3 */}
        <div className="col-span-2 space-y-8 sticky top-8 px-4 md:px-0">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">השוואת מחירים כוללת</h2>
            <ShoppingListPriceComparison 
              comparisons={priceComparisons || []} 
              isLoading={isLoadingPrices}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
