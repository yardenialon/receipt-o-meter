
import { Check, AlertCircle } from "lucide-react";

interface ComparisonItemProps {
  name: string;
  price: number | null;
  quantity: number;
  isAvailable: boolean;
  storeId?: string | null;
}

export const ComparisonItem = ({ 
  name, 
  price, 
  quantity, 
  isAvailable,
  storeId
}: ComparisonItemProps) => {
  const formattedPrice = price ? price.toFixed(2) : "0.00";
  const totalPrice = price ? (price * quantity).toFixed(2) : "0.00";

  return (
    <div className="flex justify-between items-center py-2">
      <div className="flex items-center gap-2">
        {isAvailable ? (
          <Check className="h-4 w-4 text-green-500 shrink-0" />
        ) : (
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
        )}
        <div className="text-sm">
          <div>{name}</div>
          {storeId && (
            <div className="text-xs text-gray-500">
              סניף: {storeId}
            </div>
          )}
        </div>
      </div>
      <div className="text-sm">
        {isAvailable ? (
          <div className="flex flex-col items-end">
            <div>₪{formattedPrice}</div>
            {quantity > 1 && (
              <div className="text-xs text-gray-500">
                סה"כ: ₪{totalPrice} ({quantity}x)
              </div>
            )}
          </div>
        ) : (
          <span className="text-amber-500 text-xs">לא זמין</span>
        )}
      </div>
    </div>
  );
}
