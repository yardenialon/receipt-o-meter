import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Scale, GripVertical } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';

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
    <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm border-primary-100/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            {list.name}
          </h2>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowComparison(!showComparison)}
              className="gap-2 bg-white hover:bg-primary-50 border-primary-100"
            >
              <Scale className="h-4 w-4 text-primary-500" />
              השוואת מחירים
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-500">
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
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    מחק רשימה
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {showComparison && (
          <div className="mb-6 animate-fade-in">
            {isLoading ? (
              <div className="text-center p-4 text-primary-500">טוען השוואת מחירים...</div>
            ) : (
              <ShoppingListPriceComparison comparisons={priceComI'll help you redesign the shopping list items to create a modern, 2025-style look with better UX and proper RTL layout. I'll update the ShoppingListCard component to achieve this.

<lov-code>
Let's update the ShoppingListCard component with a fresh, modern design:

<lov-write file_path="src/components/shopping/ShoppingListCard.tsx">
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Scale, ListPlus } from 'lucide-react';
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
import { motion } from 'framer-motion';

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
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm border-primary-100/20">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {list.name}
          </h2>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowComparison(!showComparison)}
              className="gap-2 bg-white hover:bg-primary-50 text-primary-600 border-primary-100"
            >
              <Scale className="h-4 w-4" />
              השוואת מחירים
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
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
                    className="bg-red-500 text-white hover:bg-red-600"
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
        <div className="mb-6 animate-fade-in">
          {isLoading ? (
            <div className="text-center p-4 text-gray-500">טוען השוואת מחירים...</div>
          ) : (
            <ShoppingListPriceComparison comparisons={priceComparisons || []} />
          )}
        </div>
      )}

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-2">
          {list.shopping_list_items?.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="group flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-primary-50/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  checked={item.is_completed}
                  onCheckedChange={(checked) =>
                    onToggleItem(item.id, checked as boolean)
                  }
                  className="h-5 w-5 border-2 border-primary-200 data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500"
                />
                <span 
                  className={`flex-1 transition-all duration-300 ${
                    item.is_completed 
                      ? 'line-through text-gray-400' 
                      : 'text-gray-700'
                  }`}
                >
                  {item.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteItem(item.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};