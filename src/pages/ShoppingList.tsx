
import { Button } from '@/components/ui/button';
import { ListPlus } from 'lucide-react';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import { ShoppingPriceComparison } from '@/components/shopping/ShoppingPriceComparison';
import { ShoppingListContainer } from '@/components/shopping/ShoppingListContainer';

export default function ShoppingList() {
  const { lists, isLoading, createList, deleteList } = useShoppingLists();

  // Get all items across all lists for price comparison
  const allItems = lists?.flatMap(list => list.shopping_list_items) || [];

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

      {/* רשימות קניות יקבלו 1/3 והשוואת מחירים תקבל 2/3 */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* עמודת רשימות קניות - תופסת 1/3 */}
        <div className="space-y-8 px-4 md:px-0">
          {lists?.map((list) => (
            <ShoppingListContainer
              key={list.id}
              list={list}
              onDeleteList={(id) => deleteList.mutate(id)}
            />
          ))}
        </div>

        {/* עמודת השוואת מחירים - תופסת 2/3 */}
        <div className="col-span-2 space-y-8 sticky top-8 px-4 md:px-0">
          <ShoppingPriceComparison items={allItems} />
        </div>
      </div>
    </div>
  );
}
