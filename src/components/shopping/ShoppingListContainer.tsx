
import { ProductsSearch } from '@/components/products/ProductsSearch';
import { ShoppingListCard } from '@/components/shopping/ShoppingListCard';
import { useShoppingListItems } from '@/hooks/useShoppingListItems';

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

  const handleAddProductToList = (product: any) => {
    console.log('Product selected:', product);
    
    if (!product || (!product.name && !product.product_name)) {
      return;
    }
    
    addItem.mutate({
      listId: list.id,
      name: product.product_name || product.name, 
      productCode: product.product_code
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <ProductsSearch
          onProductSelect={(product) => handleAddProductToList(product)}
        />
      </div>
      <ShoppingListCard
        list={list}
        onToggleItem={(id, isCompleted) => toggleItem.mutate({ id, isCompleted })}
        onDeleteItem={(id) => deleteItem.mutate(id)}
        onDeleteList={(id) => onDeleteList(id)}
      />
    </div>
  );
};
