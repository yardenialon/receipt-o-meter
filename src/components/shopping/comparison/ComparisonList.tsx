
import { StoreCard } from "./StoreCard";
import { StoreComparison } from "@/types/shopping";

interface ComparisonListProps {
  comparisons: StoreComparison[];
  cheapestTotal: number;
  mostExpensiveTotal: number;
  branchInfo?: Record<string, any>;
}

export const ComparisonList = ({ 
  comparisons, 
  cheapestTotal, 
  mostExpensiveTotal,
  branchInfo = {}
}: ComparisonListProps) => {
  // וודא שיש לנו נתונים לפני הרינדור
  if (!comparisons || comparisons.length === 0) {
    return (
      <div className="text-center p-6 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">לא נמצאו חנויות עם מידע מתאים</p>
      </div>
    );
  }

  console.log(`ComparisonList rendering ${comparisons.length} stores:`, 
    comparisons.map(c => `${c.storeName} (${c.availableItemsCount}/${c.items.length})`));

  // מיון החנויות: קודם כל חנויות עם כל הפריטים, אחר כך לפי מחיר
  const sortedComparisons = [...comparisons].sort((a, b) => {
    // 1. קודם כל, סדר לפי כמות פריטים זמינים (יורד)
    if (a.availableItemsCount !== b.availableItemsCount) {
      return b.availableItemsCount - a.availableItemsCount;
    }
    
    // 2. אם יש אותו מספר פריטים, סדר לפי מחיר (עולה) - רק אם לשניהם יש מחיר
    if (a.total > 0 && b.total > 0) {
      return a.total - b.total;
    }
    
    // 3. אם לאחד אין מחיר, העדף את זה שיש לו מחיר
    if (a.total === 0 && b.total > 0) return 1;
    if (a.total > 0 && b.total === 0) return -1;
    
    // 4. אם לשניהם אין מחיר, סדר לפי שם
    return a.storeName.localeCompare(b.storeName);
  });

  console.log('Sorted comparisons for display:', 
    sortedComparisons.map(c => `${c.storeName} (${c.availableItemsCount}/${c.items.length})`));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedComparisons.map((comparison, index) => {
          // בדיקה האם החנות מכילה את כל הפריטים
          const isComplete = comparison.availableItemsCount === comparison.items.length;
          
          // בדיקה האם זו החנות הזולה ביותר עבור סלים מלאים
          const isLowestPrice = isComplete && comparison.total === cheapestTotal && cheapestTotal > 0;
          
          // חישוב הפרש המחיר באחוזים לעומת החנות הזולה ביותר
          let priceDiff = null;
          if (isComplete && cheapestTotal > 0 && comparison.total > cheapestTotal) {
            priceDiff = ((comparison.total - cheapestTotal) / cheapestTotal * 100).toFixed(1);
          }
          
          // חישוב התקדמות החיסכון (לפי הטווח בין היקר ביותר לזול ביותר)
          let progressValue = 0;
          if (mostExpensiveTotal > cheapestTotal) {
            progressValue = 100 - ((comparison.total - cheapestTotal) / (mostExpensiveTotal - cheapestTotal) * 100);
          }
          
          // מידע על הסניף, אם יש
          const branchData = comparison.storeId ? branchInfo[comparison.storeId] || {} : {};
          
          return (
            <StoreCard
              key={`${comparison.storeName}-${index}`}
              comparison={comparison}
              isComplete={isComplete}
              isCheapest={isLowestPrice}
              priceDiff={priceDiff}
              progressValue={progressValue}
              index={index}
              branchName={branchData.name}
              branchAddress={branchData.address}
              chainName={branchData.chainName}
              logoUrl={branchData.logoUrl}
            />
          );
        })}
      </div>
    </div>
  );
}
