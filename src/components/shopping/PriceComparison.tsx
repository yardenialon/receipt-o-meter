import { Card } from "@/components/ui/card";
import { Store, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

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
  availableItemsCount: number;
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

  // Filter stores with all items available
  const completeBaskets = comparisons.filter(store => 
    store.items.every(item => item.isAvailable)
  );

  // Calculate savings only if we have complete baskets
  let cheapestTotal = 0;
  let mostExpensiveTotal = 0;
  let potentialSavings = 0;
  let savingsPercentage = "0.0";

  if (completeBaskets.length > 0) {
    cheapestTotal = Math.min(...completeBaskets.map(c => c.total));
    mostExpensiveTotal = Math.max(...completeBaskets.map(c => c.total));
    potentialSavings = mostExpensiveTotal - cheapestTotal;
    savingsPercentage = ((potentialSavings / mostExpensiveTotal) * 100).toFixed(1);
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {potentialSavings > 0 && completeBaskets.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-100">
              <div className="flex items-center gap-3 text-green-700">
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingDown className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold">חיסכון פוטנציאלי</h4>
                  <p className="text-sm">
                    ניתן לחסוך עד ₪{potentialSavings.toFixed(2)} ({savingsPercentage}%) בקנייה ברשת {completeBaskets[0].storeName}
                    {completeBaskets[0].storeId && ` (סניף ${completeBaskets[0].storeId})`}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {comparisons.map((comparison, index) => {
            const isComplete = comparison.items.every(item => item.isAvailable);
            const priceDiff = isComplete && completeBaskets.length > 0 ? 
              ((comparison.total - cheapestTotal) / cheapestTotal * 100).toFixed(1) : 
              null;
            const progressValue = mostExpensiveTotal > 0 ? 
              (comparison.total / mostExpensiveTotal) * 100 : 
              0;
            const unavailableItems = comparison.items.filter(item => !item.isAvailable);
            const availableItems = comparison.items.filter(item => item.isAvailable);
            
            return (
              <motion.div
                key={`${comparison.storeName}-${comparison.storeId}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`p-4 ${isComplete && comparison.total === cheapestTotal ? 'border-green-200 bg-green-50/30' : ''}`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={isComplete && comparison.total === cheapestTotal ? "default" : "secondary"}>
                            <Store className="h-4 w-4 mr-1" />
                            {comparison.storeName}
                            {comparison.storeId && ` (סניף ${comparison.storeId})`}
                          </Badge>
                          {isComplete && comparison.total === cheapestTotal && (
                            <Badge variant="outline" className="text-green-800 border-green-200 bg-green-50">
                              המחיר הזול ביותר
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {unavailableItems.length > 0 ? (
                            <div className="flex items-center gap-1 text-amber-600 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              <span>{unavailableItems.length} פריטים חסרים</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-green-600 text-sm">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>כל הפריטים זמינים</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-lg font-bold">
                        ₪{comparison.total.toFixed(2)}
                        {isComplete && priceDiff && Number(priceDiff) > 0 && (
                          <span className="text-sm text-muted-foreground mr-2">
                            (+{priceDiff}%)
                          </span>
                        )}
                      </div>
                    </div>

                    <Progress value={progressValue} className="h-2" />

                    <div className="space-y-2 divide-y">
                      {/* Available Items */}
                      {availableItems.map((item, itemIndex) => (
                        <div 
                          key={`available-${itemIndex}`}
                          className="flex justify-between py-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span>
                              {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                            </span>
                          </div>
                          <span className="font-medium">
                            ₪{(item.price! * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      
                      {/* Unavailable Items */}
                      {unavailableItems.map((item, itemIndex) => (
                        <div 
                          key={`unavailable-${itemIndex}`}
                          className="flex justify-between py-2 text-sm text-muted-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <span>
                              {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                            </span>
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                              לא במלאי
                            </Badge>
                          </div>
                          <span>-</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};