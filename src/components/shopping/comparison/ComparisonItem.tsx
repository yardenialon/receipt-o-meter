
import { AlertCircle, Check, AlertTriangle } from "lucide-react";

interface ComparisonItemProps {
  name: string;
  price: number | null;
  quantity: number;
  isAvailable: boolean;
  matchedProduct?: string;
}

export const ComparisonItem = ({ 
  name, 
  price, 
  quantity,
  isAvailable,
  matchedProduct
}: ComparisonItemProps) => {
  return (
    <div className={`py-2 flex justify-between items-center ${!isAvailable ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-2">
        {isAvailable ? (
          <Check className="h-4 w-4 text-green-500 mt-1 shrink-0" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
        )}
        <div>
          <div className="text-sm font-medium">{name}</div>
          {matchedProduct && matchedProduct !== name && (
            <div className="text-xs text-gray-500">התאמה: {matchedProduct}</div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1 ml-2">
        {quantity > 1 && (
          <span className="text-xs text-gray-500">x{quantity}</span>
        )}
        {isAvailable && price !== null ? (
          <>
            <span className="text-sm font-medium">₪{price.toFixed(2)}</span>
            {quantity > 1 && (
              <span className="text-xs text-gray-500">
                (₪{(price * quantity).toFixed(2)})
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-gray-500">לא זמין</span>
        )}
      </div>
    </div>
  );
};
