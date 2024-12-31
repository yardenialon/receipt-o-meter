import { Button } from '@/components/ui/button';
import { Scale, Trash2 } from 'lucide-react';
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

interface ShoppingListHeaderProps {
  name: string;
  onToggleComparison: () => void;
  onDeleteList: (id: string) => void;
  listId: string;
}

export const ShoppingListHeader = ({ 
  name, 
  onToggleComparison, 
  onDeleteList,
  listId 
}: ShoppingListHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6" dir="rtl">
      <h2 className="text-xl font-semibold text-gray-800">
        {name}
      </h2>
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={onToggleComparison}
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
                onClick={() => onDeleteList(listId)}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                מחק רשימה
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};