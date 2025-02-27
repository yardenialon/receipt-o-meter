
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { ComparisonItem } from "./ComparisonItem";
import { StoreLogo } from "./StoreLogo";

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
  branchName?: string | null;
  branchAddress?: string | null;
  chainName?: string;
  logoUrl?: string | null;
}

export const StoreCard = ({ 
  comparison, 
  isComplete, 
  isCheapest, 
  priceDiff, 
  progressValue, 
  index,
  branchName,
  branchAddress,
  chainName,
  logoUrl
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
          <div className="flex flex-col items-center gap-2 text-center">
            <StoreLogo 
              storeName={chainName || comparison.storeName} 
              logoUrl={logoUrl}
              className="h-8 w-auto mb-1" 
            />
            
            {branchName && (
              <div className="text-base font-medium text-gray-700">
                {branchName}
              </div>
            )}
            
            {branchAddress && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                {branchAddress}
              </div>
            )}
            
            <div className="text-2xl font-bold mt-2">
              ₪{comparison.total.toFixed(2)}
              {isComplete && priceDiff && Number(priceDiff) > 0 && (
                <span className="text-sm text-muted-foreground mr-2">
                  (+{priceDiff}%)
                </span>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {comparison.storeId && (
                <Badge variant="outline" className="text-sm">
                  סניף {comparison.storeId}
                </Badge>
              )}
              {isCheapest && (
                <Badge variant="outline" className="text-green-800 border-green-200 bg-green-50">
                  המחיר הזול ביותר
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              {unavailableItems.length > 0 ? (
                <div className="flex items-center gap-1 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{unavailableItems.length} פריטים חסרים</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>כל הפריטים זמינים</span>
                </div>
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
                matchedProduct={item.matchedProduct}
              />
            ))}
            
            {unavailableItems.map((item, itemIndex) => (
              <ComparisonItem
                key={`unavailable-${itemIndex}`}
                name={item.name}
                price={item.price}
                quantity={item.quantity}
                isAvailable={false}
                matchedProduct={item.matchedProduct}
              />
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
