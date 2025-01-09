import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence } from "framer-motion";
import { SavingsCard } from "./comparison/SavingsCard";
import { StoreCard } from "./comparison/StoreCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface BranchMapping {
  source_chain: string;
  source_branch_id: string;
  source_branch_name: string | null;
}

interface StoreBranch {
  branch_id: string;
  name: string;
  address: string | null;
  chain_id: string;
  store_chains?: {
    name: string;
    logo_url: string | null;
  };
  branch_mappings?: BranchMapping[];
}

interface StoreComparison {
  storeName: string;
  storeId: string | null;
  branchName?: string | null;
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
  const { data: branchInfo } = useQuery({
    queryKey: ['store-branches-full', comparisons.map(c => c.storeId).join(',')],
    queryFn: async () => {
      if (!comparisons.length) return {};
      
      const { data: branches } = await supabase
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
          branch_mappings!inner (
            source_chain,
            source_branch_id,
            source_branch_name
          )
        `)
        .in('branch_id', comparisons.map(c => c.storeId || ''));
      
      const branchData: Record<string, any> = {};
      
      branches?.forEach((branch: StoreBranch) => {
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
      
      return branchData;
    },
    enabled: comparisons.length > 0
  });

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

  // סינון סלים שלמים
  const completeBaskets = comparisons.filter(store => 
    store.items.every(item => item.isAvailable)
  );

  // חישוב חסכון רק אם יש סלים שלמים
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
          <SavingsCard
            potentialSavings={potentialSavings}
            savingsPercentage={savingsPercentage}
            storeName={completeBaskets[0].storeName}
            storeId={completeBaskets[0].storeId}
          />
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
            
            const branchData = branchInfo?.[comparison.storeId || ''] || {};
            
            return (
              <StoreCard
                key={`${comparison.storeName}-${comparison.storeId}-${index}`}
                comparison={comparison}
                isComplete={isComplete}
                isCheapest={isComplete && comparison.total === cheapestTotal}
                priceDiff={priceDiff}
                progressValue={progressValue}
                index={index}
                branchName={branchData.name || comparison.branchName}
                branchAddress={branchData.address}
                chainName={branchData.chainName || comparison.storeName}
                logoUrl={branchData.logoUrl}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};