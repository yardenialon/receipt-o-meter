
import { Card } from '@/components/ui/card';
import { ShoppingListPriceComparison } from '@/components/shopping/PriceComparison';
import { useShoppingListPrices } from '@/hooks/useShoppingListPrices';
import { ShoppingListItem } from '@/types/shopping';

interface ShoppingPriceComparisonProps {
  items: ShoppingListItem[];
}

export const ShoppingPriceComparison = ({ items }: ShoppingPriceComparisonProps) => {
  const { data: priceComparisons, isLoading } = useShoppingListPrices(items);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">השוואת מחירים כוללת</h2>
      <ShoppingListPriceComparison 
        comparisons={priceComparisons || []} 
        isLoading={isLoading}
      />
    </Card>
  );
};
