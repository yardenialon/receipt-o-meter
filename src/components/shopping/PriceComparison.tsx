import { Card } from "@/components/ui/card";
import { Store, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface StoreTotal {
  storeName: string;
  storeId: string | null;
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
  if (!comparisons.length) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          לא נמצאו חנויות עם כל המוצרים המבוקשים
        </p>
      </Card>
    );
  }

  const sortedComparisons = [...comparisons].sort((a, b) => a.total - b.total);
  const cheapestTotal = sortedComparisons[0].total;
  const mostExpensiveTotal = sortedComparisons[sortedComparisons.length - 1].total;
  const potentialSavings = mostExpensiveTotal - cheapestTotal;
  const savingsPercentage = ((potentialSavings / mostExpensiveTotal) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {potentialSavings > 0 && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-100">
          <div className="flex items-center gap-3 text-green-700">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-lg font-semibold">חיסכון פוטנציאלי</h4>
              <p className="text-sm">
                ניתן לחסוך עד ₪{potentialSavings.toFixed(2)} ({savingsPercentage}%) בקנייה ברשת {sortedComparisons[0].storeName}
                {sortedComparisons[0].storeId && ` (סניף ${sortedComparisons[0].storeId})`}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {sortedComparisons.map((comparison, index) => {
          const isLowestPrice = comparison.total === cheapestTotal;
          const priceDiff = isLowestPrice ? 0 : ((comparison.total - cheapestTotal) / cheapestTotal * 100).toFixed(1);
          const progressValue = (comparison.total / mostExpensiveTotal) * 100;
          
          return (
            <Card key={`${comparison.storeName}-${comparison.storeId}-${index}`} className={`p-4 ${isLowestPrice ? 'border-green-200' : ''}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant={isLowestPrice ? "default" : "secondary"}>
                      <Store className="h-4 w-4 mr-1" />
                      {comparison.storeName}
                      {comparison.storeId && ` (סניף ${comparison.storeId})`}
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

                <Progress value={progressValue} className="h-2" />

                <div className="space-y-2 mt-4">
                  {comparison.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>
                          {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.matchedProduct}
                        </span>
                      </div>
                      <span className="font-medium">₪{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};