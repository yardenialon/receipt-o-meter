import { Card } from "@/components/ui/card";
import { Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StoreTotal {
  storeName: string;
  total: number;
  items: {
    name: string;
    price: number;
    matchedProduct: string;
    quantity: number;
  }[];
}

interface PriceComparisonProps {
  comparisons: StoreTotal[];
}

export const ShoppingListPriceComparison = ({ comparisons }: PriceComparisonProps) => {
  if (!comparisons.length) return null;

  const sortedComparisons = [...comparisons].sort((a, b) => a.total - b.total);
  const cheapestTotal = sortedComparisons[0].total;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">השוואת מחירים</h3>
      {sortedComparisons.map((comparison, index) => {
        const isLowestPrice = comparison.total === cheapestTotal;
        const priceDiff = isLowestPrice ? 0 : ((comparison.total - cheapestTotal) / cheapestTotal * 100).toFixed(1);
        
        return (
          <Card key={comparison.storeName} className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Badge variant={isLowestPrice ? "default" : "secondary"}>
                  <Store className="h-4 w-4 mr-1" />
                  {comparison.storeName}
                </Badge>
                {isLowestPrice && (
                  <Badge variant="outline" className="text-green-800 border-green-200 bg-green-50">
                    המחיר הזול ביותר
                  </Badge>
                )}
              </div>
              <div className="text-lg font-bold">
                ₪{comparison.total.toFixed(2)}
                {!isLowestPrice && (
                  <span className="text-sm text-muted-foreground mr-2">
                    (+{priceDiff}%)
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {comparison.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                    </span>
                    {item.matchedProduct !== item.name && (
                      <span className="text-xs text-muted-foreground"> → {item.matchedProduct}</span>
                    )}
                  </div>
                  <span>₪{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
};