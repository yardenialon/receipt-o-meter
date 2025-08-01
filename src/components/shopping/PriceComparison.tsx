
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ComparisonHeader } from "./comparison/ComparisonHeader";
import { ComparisonList } from "./comparison/ComparisonList";
import { StoreComparison } from "@/types/shopping";

interface PriceComparisonProps {
  comparisons: StoreComparison[];
  isLoading?: boolean;
}

export const ShoppingListPriceComparison = ({ comparisons, isLoading }: PriceComparisonProps) => {
  console.log('Initial comparisons received:', comparisons);

  // בוא נבדוק באופן מפורש אילו חנויות התקבלו בהתחלה
  if (comparisons?.length > 0) {
    console.log('Stores received in comparisons:');
    comparisons.forEach(comp => {
      console.log(`Store: ${comp.storeName}, Available Items: ${comp.availableItemsCount}/${comp.items.length}, Total: ${comp.total}`);
    });
  }

  // וודא שקיבלנו מידע
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <p className="text-center text-muted-foreground mt-2">
          מחשב השוואת מחירים...
        </p>
      </div>
    );
  }

  if (!comparisons || comparisons.length === 0) {
    return (
      <div className="p-6">
        <p className="text-center text-muted-foreground">
          לא נמצאו חנויות עם מידע על המוצרים המבוקשים
        </p>
      </div>
    );
  }

  // נרמול שמות רשתות
  const normalizedComparisons = comparisons.map(comparison => {
    let displayName = comparison.storeName;
    
    // חישוב הסכום הכולל לחנות - רק עבור פריטים זמינים
    const total = comparison.items.reduce((sum, item) => {
      if (item.isAvailable && item.price !== null) {
        const itemTotal = item.price * (item.quantity || 1);
        return sum + itemTotal;
      }
      return sum;
    }, 0);

    return {
      ...comparison,
      storeName: displayName,
      total
    };
  });

  console.log('Normalized comparisons:', normalizedComparisons.map(c => 
    `${c.storeName} (${c.availableItemsCount}/${c.items.length})`
  ));

  const { data: branchInfo } = useQuery({
    queryKey: ['store-branches-full', normalizedComparisons.map(c => c.storeId).join(',')],
    queryFn: async () => {
      if (!normalizedComparisons.length) return {};
      
      const storeIds = normalizedComparisons.map(c => c.storeId || '').filter(Boolean);
      console.log('Fetching branch info for store IDs:', storeIds);
      
      if (storeIds.length === 0) {
        console.log('No valid store IDs to fetch');
        return {};
      }

      const { data: branches, error } = await supabase
        .from('branch_mappings')
        .select(`
          source_branch_id,
          source_branch_name,
          source_chain
        `)
        .in('source_branch_id', storeIds);
      
      if (error) {
        console.error('Error fetching branch info:', error);
        return {};
      }
      
      const branchData: Record<string, any> = {};
      
      if (branches) {
        console.log('Branch mappings found:', branches);
        branches.forEach((mapping: any) => {
          branchData[mapping.source_branch_id] = {
            name: mapping.source_branch_name,
            address: null, // נוסיף מאוחר יותר אם נצטרך
            chainName: mapping.source_chain,
            logoUrl: null // נוסיף מאוחר יותר אם נצטרך
          };
        });
      }
      
      console.log('Final branch data:', branchData);
      return branchData;
    },
    enabled: normalizedComparisons.length > 0
  });

  // סינון סלים שלמים (כל הפריטים זמינים)
  const completeBaskets = normalizedComparisons.filter(store => 
    store.availableItemsCount === store.items.length
  );

  console.log('Complete baskets:', completeBaskets.map(c => c.storeName));

  // חישוב חסכון - רק עבור סלים שלמים
  let cheapestTotal = 0;
  let mostExpensiveTotal = 0;
  let potentialSavings = 0;
  let savingsPercentage = "0";
  
  if (completeBaskets.length > 0) {
    cheapestTotal = Math.min(...completeBaskets.map(c => c.total));
    mostExpensiveTotal = Math.max(...completeBaskets.map(c => c.total));
    potentialSavings = mostExpensiveTotal - cheapestTotal;
    savingsPercentage = ((potentialSavings / mostExpensiveTotal) * 100).toFixed(1);
  } else {
    // אם אין סלים שלמים, חשב ערכים עבור כל הסלים (אבל ציין שההשוואה חלקית)
    if (normalizedComparisons.length > 0) {
      cheapestTotal = Math.min(...normalizedComparisons.map(c => c.total));
      mostExpensiveTotal = Math.max(...normalizedComparisons.map(c => c.total));
      potentialSavings = mostExpensiveTotal - cheapestTotal;
      savingsPercentage = ((potentialSavings / mostExpensiveTotal) * 100).toFixed(1);
    }
  }

  return (
    <div className="space-y-6">
      <ComparisonHeader
        potentialSavings={potentialSavings}
        savingsPercentage={savingsPercentage}
        storeName={completeBaskets[0]?.storeName}
        storeId={completeBaskets[0]?.storeId}
        completeBaskets={completeBaskets.length}
      />

      <ComparisonList
        comparisons={normalizedComparisons}
        cheapestTotal={cheapestTotal}
        mostExpensiveTotal={mostExpensiveTotal}
        branchInfo={branchInfo || {}}
      />
    </div>
  );
};
