
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

  const normalizedComparisons = comparisons.map(comparison => {
    let normalizedStoreName = comparison.storeName?.toLowerCase().trim() || '';
    let displayName = comparison.storeName;
    
    // חישוב הסכום הכולל לחנות - רק עבור פריטים זמינים
    const total = comparison.items.reduce((sum, item) => {
      if (item.isAvailable && item.price !== null) {
        const itemTotal = item.price * (item.quantity || 1);
        console.log(`Item calculation - Name: ${item.name}, Price: ${item.price}, Quantity: ${item.quantity}, Total: ${itemTotal}`);
        return sum + itemTotal;
      }
      return sum;
    }, 0);

    console.log(`Store: ${displayName}, Total: ${total}`);

    // נרמול שמות רשתות
    const yochananofVariations = [
      'yochananof', 'יוחננוף', 'יוחנונוף', 'יוחננוב',
      'יוחננוף טוב טעם', 'יוחננוף טוב טעם בעמ', 'טוב טעם יוחננוף',
      'טוב טעם', 'tov taam', 'tovtaam', 'טוב טעם בעמ', 'טוב טעם רשת'
    ];

    const ramiLevyVariations = [
      'רמי לוי', 'rami levy', 'רמי לוי שיווק השקמה',
      'שיווק השקמה', 'רמי לוי שיווק השיקמה', 'רמי לוי סניף'
    ];

    const shufersalVariations = [
      'שופרסל', 'shufersal', 'שופרסל אונליין',
      'שופרסל דיל', 'שופרסל שלי', 'שופרסל אקספרס'
    ];

    if (yochananofVariations.some(variant => 
      normalizedStoreName.includes(variant.toLowerCase()) || 
      comparison.storeName?.includes(variant)
    )) {
      displayName = 'יוחננוף';
    } else if (ramiLevyVariations.some(variant =>
      normalizedStoreName.includes(variant.toLowerCase()) ||
      comparison.storeName?.includes(variant)
    )) {
      displayName = 'רמי לוי';
    } else if (shufersalVariations.some(variant =>
      normalizedStoreName.includes(variant.toLowerCase()) ||
      comparison.storeName?.includes(variant)
    )) {
      displayName = 'שופרסל';
    }

    return {
      ...comparison,
      storeName: displayName,
      total
    };
  });

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
        .from('store_branches')
        .select(`
          branch_id,
          name,
          address,
          chain_id,
          store_chains (
            name,
            logo_url
          ),
          branch_mappings (
            source_chain,
            source_branch_id,
            source_branch_name
          )
        `)
        .in('branch_id', storeIds);
      
      if (error) {
        console.error('Error fetching branch info:', error);
        return {};
      }
      
      const branchData: Record<string, any> = {};
      
      if (branches) {
        branches.forEach((branch: any) => {
          if (branch.branch_mappings && branch.branch_mappings.length > 0) {
            const mapping = branch.branch_mappings[0];
            branchData[mapping.source_branch_id] = {
              name: mapping.source_branch_name || branch.name,
              address: branch.address,
              chainName: branch.store_chains?.name || mapping.source_chain,
              logoUrl: branch.store_chains?.logo_url
            };
          }
        });
      }
      
      return branchData;
    },
    enabled: normalizedComparisons.length > 0
  });

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

  if (!normalizedComparisons.length) {
    return (
      <div className="p-6">
        <p className="text-center text-muted-foreground">
          לא נמצאו חנויות עם מידע על המוצרים המבוקשים
        </p>
      </div>
    );
  }

  console.log('Normalized comparisons:', normalizedComparisons);

  // סינון סלים שלמים (כל הפריטים זמינים)
  const completeBaskets = normalizedComparisons.filter(store => 
    store.items.every(item => item.isAvailable)
  );

  console.log('Complete baskets:', completeBaskets);

  // חישוב חסכון
  const cheapestTotal = completeBaskets.length > 0 ? 
    Math.min(...completeBaskets.map(c => c.total)) : 0;
  const mostExpensiveTotal = completeBaskets.length > 0 ? 
    Math.max(...completeBaskets.map(c => c.total)) : 0;
  const potentialSavings = mostExpensiveTotal - cheapestTotal;
  const savingsPercentage = ((potentialSavings / mostExpensiveTotal) * 100).toFixed(1);

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
