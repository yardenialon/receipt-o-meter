import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddItemFormProps {
  listId: string;
  onAddItem: (listId: string, name: string) => void;
}

export const AddItemForm = ({ listId, onAddItem }: AddItemFormProps) => {
  const [itemName, setItemName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim()) {
      onAddItem(listId, itemName.trim());
      setItemName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="הוסף פריט חדש..."
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
      />
      <Button type="submit">
        הוסף
      </Button>
    </form>
  );
};