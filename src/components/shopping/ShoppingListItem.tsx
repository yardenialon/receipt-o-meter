import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShoppingListItemProps {
  item: {
    id: string;
    name: string;
    is_completed: boolean;
  };
  onToggle: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
}

export const ShoppingListItem = ({ item, onToggle, onDelete }: ShoppingListItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-primary-50/50 transition-all duration-300"
    >
      <div className="flex items-center gap-3 flex-1">
        <Checkbox
          checked={item.is_completed}
          onCheckedChange={(checked) => onToggle(item.id, checked as boolean)}
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
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};