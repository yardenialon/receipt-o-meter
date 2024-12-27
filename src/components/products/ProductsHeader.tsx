import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ProductsHeaderProps {
  onUpdatePrices: () => void;
  isUpdating: boolean;
}

export const ProductsHeader = ({ onUpdatePrices, isUpdating }: ProductsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">מוצרים</h1>
      <Button 
        onClick={onUpdatePrices} 
        disabled={isUpdating}
        className="flex items-center gap-2"
      >
        {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
        עדכן מחירים משופרסל
      </Button>
    </div>
  );
};