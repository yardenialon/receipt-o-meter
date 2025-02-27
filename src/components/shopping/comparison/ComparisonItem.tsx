
import { Check, AlertCircle, Store, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Product } from "@/types/shopping";
import { normalizeChainName } from "@/utils/shopping/productUtils";

interface ComparisonItemProps {
  name: string;
  price: number | null;
  quantity: number;
  isAvailable: boolean;
  storeId?: string | null;
  matchedProducts?: Product[];
}

export const ComparisonItem = ({ 
  name, 
  price, 
  quantity, 
  isAvailable,
  storeId,
  matchedProducts = []
}: ComparisonItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const formattedPrice = price ? price.toFixed(2) : "0.00";
  const totalPrice = price ? (price * quantity).toFixed(2) : "0.00";
  
  // קבץ מוצרים לפי רשת
  const productsByChain: Record<string, Product[]> = {};
  if (matchedProducts && matchedProducts.length > 0) {
    matchedProducts.forEach(product => {
      if (!product.store_chain) return;
      
      const chainName = normalizeChainName(product.store_chain);
      if (!productsByChain[chainName]) {
        productsByChain[chainName] = [];
      }
      productsByChain[chainName].push(product);
    });
  }
  
  // מיון המוצרים בכל רשת לפי מחיר
  Object.keys(productsByChain).forEach(chain => {
    productsByChain[chain].sort((a, b) => a.price - b.price);
  });
  
  // בדוק אם יש מוצרים זמינים במספר רשתות
  const multipleChains = Object.keys(productsByChain).length > 1;

  return (
    <div className="py-2">
      <div className="flex justify-between items-center">
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
            
            {multipleChains && (
              <button 
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-blue-600 flex items-center mt-1"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    הסתר אפשרויות
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    הצג בעוד {Object.keys(productsByChain).length - 1} רשתות
                  </>
                )}
              </button>
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
      
      {expanded && multipleChains && (
        <div className="mt-2 border-t pt-2 border-dashed border-gray-200">
          <div className="text-xs font-medium mb-1">זמין גם ברשתות:</div>
          <div className="space-y-2">
            {Object.entries(productsByChain).map(([chainName, products]) => {
              if (products.length === 0) return null;
              
              // מצא את המוצר הזול ביותר ברשת זו
              const cheapestProduct = products[0]; // כבר ממוין לפי מחיר
              const productPrice = cheapestProduct.price;
              const productTotal = productPrice * quantity;
              
              return (
                <div key={chainName} className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Store className="h-3 w-3 text-gray-500" />
                    <span className="text-xs">{chainName}</span>
                  </div>
                  <div className="text-xs">
                    ₪{productPrice.toFixed(2)}
                    {quantity > 1 && (
                      <span className="text-gray-500 mr-1">
                        (סה"כ: ₪{productTotal.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
