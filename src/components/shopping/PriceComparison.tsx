
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ComparisonHeader } from "./comparison/ComparisonHeader";
import { ComparisonList } from "./comparison/ComparisonList";
import { StoreComparison } from "@/types/shopping";
import { normalizeChainName } from "@/utils/shopping/storeNameUtils";

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
    // Normalize store name for consistent display and logo matching
    const normalizedName = normalizeChainName(comparison.storeName);
    
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
      storeName: normalizedName,
      total
    };
  });

  console.log('Normalized comparisons:', normalizedComparisons.map(c => 
    `${c.storeName} (${c.availableItemsCount}/${c.items.length})`
  ));

  // Fetch store chain info including logos
  const { data: chainInfo } = useQuery({
    queryKey: ['store-chains-info'],
    queryFn: async () => {
      const { data: storeChains, error } = await supabase
        .from('store_chains')
        .select('id, name, logo_url')
        .order('name');
        
      if (error) {
        console.error('Error fetching store chains:', error);
        return {};
      }
      
      const chainData: Record<string, {name: string, logoUrl: string | null}> = {};
      
      if (storeChains) {
        storeChains.forEach(chain => {
          const normalizedName = normalizeChainName(chain.name);
          let logoUrl = chain.logo_url;
          
          // Handle relative paths for logos
          if (logoUrl && !logoUrl.startsWith('/') && !logoUrl.startsWith('http')) {
            logoUrl = '/' + logoUrl;
          }
          
          chainData[normalizedName] = {
            name: chain.name,
            logoUrl
          };
        });
      }
      
      return chainData;
    },
    staleTime: 60000, // 1 minute
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
          // First try to get info from branch mapping
          if (branch.branch_mappings && branch.branch_mappings.length > 0) {
            const mapping = branch.branch_mappings[0];
            const normalizedChain = normalizeChainName(mapping.source_chain);
            
            // Get logo from chainInfo if available
            const chainLogoInfo = chainInfo?.[normalizedChain] || null;
            
            branchData[mapping.source_branch_id] = {
              name: mapping.source_branch_name || branch.name,
              address: branch.address,
              chainName: normalizedChain,
              logoUrl: chainLogoInfo?.logoUrl || branch.store_chains?.logo_url
            };
          } else if (branch.store_chains) {
            // Fallback to direct chain info
            const normalizedChain = normalizeChainName(branch.store_chains.name);
            
            branchData[branch.branch_id] = {
              name: branch.name,
              address: branch.address,
              chainName: normalizedChain,
              logoUrl: branch.store_chains.logo_url
            };
          }
        });
      }
      
      return branchData;
    },
    enabled: normalizedComparisons.length > 0
  });

  // Merge chain info with comparisons
  const enhancedComparisons = normalizedComparisons.map(comparison => {
    // Try to get logo URL from branch info first
    const branchData = comparison.storeId ? branchInfo?.[comparison.storeId] : null;
    
    // If we couldn't get from branch info, try from chain info
    const chainData = chainInfo?.[comparison.storeName];
    
    // Use chain name from branch data if available, otherwise use the normalized name
    const displayChainName = branchData?.chainName || comparison.storeName;
    
    // Use logo URL from branch data if available, otherwise use from chain data
    const logoUrl = branchData?.logoUrl || chainData?.logoUrl;
    
    return {
      ...comparison,
      chainName: displayChainName,
      logoUrl
    };
  });

  // סינון סלים שלמים (כל הפריטים זמינים)
  const completeBaskets = enhancedComparisons.filter(store => 
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
    if (enhancedComparisons.length > 0) {
      cheapestTotal = Math.min(...enhancedComparisons.map(c => c.total));
      mostExpensiveTotal = Math.max(...enhancedComparisons.map(c => c.total));
      potentialSavings = mostExpensiveTotal - cheapestTotal;
      savingsPercentage = ((potentialSavings / mostExpensiveTotal) * 100).toFixed(1);
    }
  }

  return (
    <div className="space-y-6">
      <ComparisonHeader
        potentialSavings={potentialSavings}
        savingsPercentage={savingsPercentage}
        storeName={completeBaskets[0]?.chainName || completeBaskets[0]?.storeName}
        storeId={completeBaskets[0]?.storeId}
        completeBaskets={completeBaskets.length}
      />

      <ComparisonList
        comparisons={enhancedComparisons}
        cheapestTotal={cheapestTotal}
        mostExpensiveTotal={mostExpensiveTotal}
        branchInfo={branchInfo || {}}
      />
    </div>
  );
};
