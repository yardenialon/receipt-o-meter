
import { Button } from '@/components/ui/button';
import { ListPlus } from 'lucide-react';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import { ShoppingPriceComparison } from '@/components/shopping/ShoppingPriceComparison';
import { ShoppingListContainer } from '@/components/shopping/ShoppingListContainer';
import { motion } from 'framer-motion';

export default function ShoppingList() {
  const { lists, isLoading, createList, deleteList } = useShoppingLists();

  // Get all items across all lists for price comparison
  const allItems = lists?.flatMap(list => list.shopping_list_items) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-gray-400">טוען רשימות קניות...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto md:container px-0 md:px-8 md:pb-8 pb-32" dir="rtl">
      {/* Mobile header with centered button */}
      <div className="md:hidden px-4 pt-6 pb-8 text-center">
        <h1 className="text-3xl font-bold mb-6 text-red-500">🔴 רשימות קניות - מובייל מעודכן</h1>
        <Button 
          onClick={() => createList.mutate()}
          className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg shadow-lg"
          size="lg"
        >
          <ListPlus className="h-6 w-6 ml-2" />
          רשימה חדשה
        </Button>
      </div>

      {/* Desktop header */}
      <div className="hidden md:flex items-center justify-between mb-8 px-4 md:px-0">
        <h1 className="text-3xl font-bold">רשימות קניות</h1>
        <Button 
          onClick={() => createList.mutate()}
          className="bg-primary hover:bg-primary/90 shadow-sm"
        >
          <ListPlus className="h-5 w-5 ml-2" />
          רשימה חדשה
        </Button>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden">
        <div className="space-y-6 px-4">
          {lists?.length === 0 ? (
            <div className="bg-gray-50/50 rounded-lg p-8 text-center border border-dashed border-gray-200">
              <p className="text-gray-500 mb-4">אין רשימות קניות</p>
              <Button 
                onClick={() => createList.mutate()}
                variant="outline"
                className="mx-auto"
              >
                <ListPlus className="h-4 w-4 ml-2" />
                צור רשימה חדשה
              </Button>
            </div>
          ) : (
            <div>
              {lists?.map((list, index) => (
                <motion.div 
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="mb-6"
                >
                  <ShoppingListContainer
                    list={list}
                    onDeleteList={(id) => deleteList.mutate(id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:grid gap-8 md:grid-cols-3">
        {/* Shopping lists column - takes 1/3 width */}
        <div className="space-y-6 px-4 md:px-0">
          {lists?.length === 0 ? (
            <div className="bg-gray-50/50 rounded-lg p-8 text-center border border-dashed border-gray-200">
              <p className="text-gray-500 mb-4">אין רשימות קניות</p>
              <Button 
                onClick={() => createList.mutate()}
                variant="outline"
                className="mx-auto"
              >
                <ListPlus className="h-4 w-4 ml-2" />
                צור רשימה חדשה
              </Button>
            </div>
          ) : (
            <div>
              {lists?.map((list, index) => (
                <motion.div 
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="mb-6"
                >
                  <ShoppingListContainer
                    list={list}
                    onDeleteList={(id) => deleteList.mutate(id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Price comparison column - takes 2/3 width */}
        <div className="col-span-2 space-y-8 sticky top-8 px-4 md:px-0">
          <ShoppingPriceComparison items={allItems} />
        </div>
      </div>
    </div>
  );
}
