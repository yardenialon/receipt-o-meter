
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { normalizeChainName, STORE_LOGOS } from "@/utils/shopping/storeNameUtils";

/**
 * Hook to fetch store chain information including logos
 */
export const useStoreChainInfo = () => {
  return useQuery({
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
          
          // Use our predefined logos mapping instead of DB values
          const logoUrl = STORE_LOGOS[normalizedName] || null;
          
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
};

/**
 * Hook to fetch branch information for stores
 */
export const useStoreBranchInfo = (storeIds: string[]) => {
  return useQuery({
    queryKey: ['store-branches-full', storeIds.join(',')],
    queryFn: async () => {
      if (!storeIds.length) return {};
      
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
            
            // Use our predefined logos mapping
            const logoUrl = STORE_LOGOS[normalizedChain] || null;
            
            branchData[mapping.source_branch_id] = {
              name: mapping.source_branch_name || branch.name,
              address: branch.address,
              chainName: normalizedChain,
              logoUrl
            };
          } else if (branch.store_chains) {
            // Fallback to direct chain info
            const normalizedChain = normalizeChainName(branch.store_chains.name);
            
            // Use our predefined logos mapping
            const logoUrl = STORE_LOGOS[normalizedChain] || null;
            
            branchData[branch.branch_id] = {
              name: branch.name,
              address: branch.address,
              chainName: normalizedChain,
              logoUrl
            };
          }
        });
      }
      
      console.log('Fetched branch data:', branchData);
      return branchData;
    },
    enabled: storeIds.length > 0
  });
};
