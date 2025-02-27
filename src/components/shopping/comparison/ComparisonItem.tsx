
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ComparisonItemProps {
  name: string;
  price: number | null;
  quantity: number;
  isAvailable: boolean;
  matchedProduct?: string;
}

export const ComparisonItem = ({ name, price, quantity, isAvailable, matchedProduct }: ComparisonItemProps) => {
  if (!isAvailable) {
    return (
      <div className="flex justify-between items-center py-2 text-sm text-muted-foreground" dir="rtl">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span>
            {name} {quantity > 1 && `(x${quantity})`}
          </span>
          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
            לא במלאי
          </Badge>
        </div>
        <span>-</span>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center py-2 text-sm" dir="rtl">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="font-medium">{name}</span>
          {quantity > 1 && (
            <span className="text-xs text-gray-500">x{quantity}</span>
          )}
        </div>
        
        {matchedProduct && matchedProduct !== name && (
          <div className="text-xs text-gray-500 mr-6">
            מוצר: {matchedProduct}
          </div>
        )}
      </div>
      
      <span className="font-medium whitespace-nowrap">
        ₪{(price! * quantity).toFixed(2)}
        {quantity > 1 && (
          <span className="text-xs text-gray-500 mr-1">
            (₪{price!.toFixed(2)} ליח')
          </span>
        )}
      </span>
    </div>
  );
};
