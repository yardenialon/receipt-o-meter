import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, AlertCircle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { ComparisonItem } from "./ComparisonItem";

interface StoreCardProps {
  comparison: {
    storeName: string;
    storeId: string | null;
    total: number;
    items: Array<{
      name: string;
      price: number | null;
      matchedProduct: string;
      quantity: number;
      isAvailable: boolean;
    }>;
  };
  isComplete: boolean;
  isCheapest: boolean;
  priceDiff: string | null;
  progressValue: number;
  index: number;
}

export const StoreCard = ({ 
  comparison, 
  isComplete, 
  isCheapest, 
  priceDiff, 
  progressValue, 
  index 
}: StoreCardProps) => {
  const unavailableItems = comparison.items.filter(item => !item.isAvailable);
  const availableItems = comparison.items.filter(item => item.isAvailable);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`p-4 ${isCheapest ? 'border-green-200 bg-green-50/30' : ''}`}>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={isCheapest ? "default" : "secondary"}>
                  <Store className="h-4 w-4 mr-1" />
                  {comparison.storeName}
                  {comparison.storeId && ` (סניף ${comparison.storeId})`}
                </Badge>
                {isCheapest && (
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
            {availableItems.map((item, itemIndex) => (
              <ComparisonItem
                key={`available-${itemIndex}`}
                name={item.name}
                price={item.price}
                quantity={item.quantity}
                isAvailable={true}
              />
            ))}
            
            {unavailableItems.map((item, itemIndex) => (
              <ComparisonItem
                key={`unavailable-${itemIndex}`}
                name={item.name}
                price={item.price}
                quantity={item.quantity}
                isAvailable={false}
              />
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};