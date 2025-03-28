
import { ProductsSearch } from '@/components/products/ProductsSearch';
import { useShoppingListItems } from '@/hooks/useShoppingListItems';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Trash2, Check, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ShoppingListPriceComparison } from './PriceComparison';
import { useShoppingListPrices } from '@/hooks/useShoppingListPrices';
import { AnimatePresence, motion } from 'framer-motion';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShoppingListContainerProps {
  list: {
    id: string;
    name: string;
    shopping_list_items: Array<{
      id: string;
      name: string;
      is_completed: boolean;
      product_code?: string | null;
    }>;
  };
  onDeleteList: (id: string) => void;
}

export const ShoppingListContainer = ({ 
  list, 
  onDeleteList 
}: ShoppingListContainerProps) => {
  const { toggleItem, deleteItem, addItem } = useShoppingListItems();
  const [showComparison, setShowComparison] = useState(false);
  const { data: priceComparisons, isLoading } = useShoppingListPrices(list.shopping_list_items);
  
  const totalItems = list.shopping_list_items.length;
  const completedItems = list.shopping_list_items.filter(item => item.is_completed).length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const handleAddProductToList = (product: any) => {
    if (!product || (!product.name && !product.product_name)) {
      return;
    }
    
    addItem.mutate({
      listId: list.id,
      name: product.product_name || product.name, 
      productCode: product.product_code
    });
  };

  const handleDeleteList = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הרשימה?')) {
      onDeleteList(list.id);
    }
  };

  return (
    <Card className="p-0 overflow-hidden bg-gradient-to-br from-white to-gray-50/90 backdrop-blur-sm border-primary-100/20 shadow-md" dir="rtl">
      {/* Header with progress bar */}
      <div className="relative p-4 pb-1 bg-gradient-to-r from-primary-500/10 to-primary-300/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              {list.name}
            </h2>
          </div>
          
          <div className="flex gap-1">
            <Drawer>
              <DrawerTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-primary-600 hover:bg-primary-100"
                >
                  <Scale className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="p-4">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-semibold mb-4 text-center">השוואת מחירים</h3>
                  {isLoading ? (
                    <div className="text-center p-4 text-gray-500">טוען השוואת מחירים...</div>
                  ) : (
                    <ShoppingListPriceComparison comparisons={priceComparisons || []} />
                  )}
                </div>
              </DrawerContent>
            </Drawer>

            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-red-500 hover:bg-red-50"
              onClick={handleDeleteList}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 mb-1 overflow-hidden">
          <div 
            className="h-full bg-primary-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 text-left mb-2">
          {completedItems} מתוך {totalItems} פריטים
        </div>
      </div>

      {/* Search and add items */}
      <div className="p-4 pt-2">
        <div className="relative">
          <ProductsSearch
            onSearch={() => {}}
            onProductSelect={(product) => handleAddProductToList(product)}
            placeholder="חפש מוצר לפי מקט או שם..."
            className="w-full"
          />
        </div>
      </div>

      {/* Shopping list items */}
      <ScrollArea className="h-[320px] px-4 pb-2">
        <AnimatePresence>
          {list.shopping_list_items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
              <ShoppingCart className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm">הרשימה ריקה</p>
              <p className="text-xs mt-1">הוסף פריטים באמצעות תיבת החיפוש למעלה</p>
            </div>
          ) : (
            list.shopping_list_items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "group flex items-center gap-3 p-3 my-1 rounded-xl border border-transparent transition-all duration-200",
                  item.is_completed 
                    ? "bg-gray-50/80 text-gray-400" 
                    : "hover:bg-primary-50/50 hover:border-primary-100/50"
                )}
              >
                <span 
                  className={cn(
                    "flex-1 text-sm transition-all",
                    item.is_completed && "line-through"
                  )}
                >
                  {item.name}
                </span>
                
                <button
                  onClick={() => toggleItem.mutate({ id: item.id, isCompleted: !item.is_completed })}
                  className={cn(
                    "flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors",
                    item.is_completed
                      ? "bg-primary-400 border-primary-400 text-white"
                      : "border-gray-300 hover:border-primary-400"
                  )}
                >
                  {item.is_completed && <Check className="h-3 w-3" />}
                </button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteItem.mutate(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 hover:bg-red-50 h-6 w-6"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </ScrollArea>
    </Card>
  );
};
