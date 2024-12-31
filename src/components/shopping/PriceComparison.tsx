import { Card } from "@/components/ui/card";
import { Store, TrendingDown, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StoreComparison {
  storeName: string;
  storeId: string | null;
  total: number;
  items: {
    name: string;
    price: number | null;
    matchedProduct: string;
    quantity: number;
    isAvailable: boolean;
  }[];
}

interface PriceComparisonProps {
  comparisons: StoreComparison[];
  isLoading?: boolean;
}

export const ShoppingListPriceComparison = ({ comparisons, isLoading }: PriceComparisonProps) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <p className="text-center text-muted-foreground mt-2">
          מחשב השוואת מחירים...
        </p>
      </Card>
    );
  }

  if (!comparisons.length) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          לא נמצאו חנויות עם מידע על המוצרים המבוקשים
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

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {sortedComparisons.map((comparison, index) => {
            const isLowestPrice = comparison.total === cheapestTotal;
            const priceDiff = isLowestPrice ? 0 : ((comparison.total - cheapestTotal) / cheapestTotal * 100).toFixed(1);
            const progressValue = (comparison.total / mostExpensiveTotal) * 100;
            const unavailableItems = comparison.items.filter(item => !item.isAvailable);
            
            return (
              <Card 
                key={`${comparison.storeName}-${comparison.storeId}-${index}`} 
                className={`p-4 ${isLowestPrice ? 'border-green-200 bg-green-50/30' : ''}`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
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
                      {unavailableItems.length > 0 && (
                        <div className="flex items-center gap-1 text-amber-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>{unavailableItems.length} פריטים חסרים</span>
                        </div>
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

                  <div className="space-y-2 divide-y">
                    {comparison.items.map((item, itemIndex) => (
                      <div 
                        key={itemIndex} 
                        className={`flex justify-between py-2 text-sm ${!item.isAvailable ? 'text-muted-foreground' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <span>
                            {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                          </span>
                          {!item.isAvailable && (
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                              לא במלאי
                            </Badge>
                          )}
                        </div>
                        <span className="font-medium">
                          {item.price ? `₪${(item.price * item.quantity).toFixed(2)}` : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};