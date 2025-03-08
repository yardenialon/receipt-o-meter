
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, MapPin, Store } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { ComparisonItem } from "./ComparisonItem";
import { StoreLogo } from "./StoreLogo";
import { Product } from "@/types/shopping";
import { normalizeChainName } from "@/utils/shopping/storeNameUtils";

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
      store_id?: string | null;
      matchedProducts?: Product[];
    }>;
    branches?: Record<string, string[]>;
    availableItemsCount: number;
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
  const totalItems = comparison.items.length;
  
  // Display store name, לנרמל את שם הרשת להצגה עקבית
  const displayStoreName = normalizeChainName(chainName || comparison.storeName);
  
  // חישוב מספר סניפים
  const branchCount = comparison.branches ? 
    Object.values(comparison.branches).reduce((sum, branches) => sum + branches.length, 0) : 0;

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
              storeName={displayStoreName} 
              logoUrl={logoUrl}
              className="h-8 w-auto mb-1" 
            />
            
            <div className="text-base font-medium text-gray-700">
              {displayStoreName}
            </div>
            
            {branchName && (
              <div className="text-sm text-gray-600">
                {branchName}
              </div>
            )}
            
            {branchAddress && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                {branchAddress}
              </div>
            )}
            
            {branchCount > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Store className="h-4 w-4" />
                <span>{branchCount} סניפים זמינים</span>
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
              {isCheapest && isComplete && (
                <Badge variant="outline" className="text-green-800 border-green-200 bg-green-50">
                  המחיר הזול ביותר
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              {unavailableItems.length > 0 ? (
                <div className="flex items-center gap-1 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    {comparison.availableItemsCount} מתוך {totalItems} פריטים זמינים
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>כל הפריטים זמינים</span>
                </div>
              )}
            </div>
            
            {!isComplete && (
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50/50">
                המחיר מחושב רק עבור הפריטים הזמינים
              </Badge>
            )}
          </div>

          <Progress 
            value={(comparison.availableItemsCount / totalItems) * 100} 
            className="h-2"
            color={isComplete ? "bg-green-600" : "bg-amber-500"}
          />

          <div className="space-y-2 divide-y">
            {availableItems.map((item, itemIndex) => (
              <ComparisonItem
                key={`available-${itemIndex}`}
                name={item.name}
                price={item.price}
                quantity={item.quantity}
                isAvailable={true}
                storeId={item.store_id}
                matchedProducts={item.matchedProducts}
              />
            ))}
            
            {unavailableItems.map((item, itemIndex) => (
              <ComparisonItem
                key={`unavailable-${itemIndex}`}
                name={item.name}
                price={item.price}
                quantity={item.quantity}
                isAvailable={false}
                matchedProducts={item.matchedProducts}
              />
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
