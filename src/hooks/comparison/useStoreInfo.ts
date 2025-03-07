
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { normalizeChainName } from "@/utils/shopping/storeNameUtils";

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
          
          // Make sure we have a valid URL for the logo
          let logoUrl = null;
          
          if (chain.logo_url) {
            // Make sure logo_url is a full URL or a valid path
            if (chain.logo_url.startsWith('http')) {
              logoUrl = chain.logo_url;
            } else if (chain.logo_url.startsWith('/')) {
              logoUrl = chain.logo_url;
            } else {
              logoUrl = '/' + chain.logo_url;
            }
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
};

/**
 * Hook to fetch branch information for stores
 * 
 * Corrected the query to properly join tables based on the DB schema
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

      // First get basic branch information
      const { data: branches, error } = await supabase
        .from('store_branches')
        .select(`
          id,
          branch_id,
          name,
          address,
          chain_id,
          store_chains (
            name,
            logo_url
          )
        `)
        .in('branch_id', storeIds);
      
      if (error) {
        console.error('Error fetching branch info:', error);
        return {};
      }
      
      // Then separately get branch mappings
      const { data: mappings, error: mappingError } = await supabase
        .from('branch_mappings')
        .select(`
          branch_id,
          source_chain,
          source_branch_id,
          source_branch_name
        `)
        .in('source_branch_id', storeIds);
        
      if (mappingError) {
        console.error('Error fetching branch mappings:', mappingError);
      }
      
      const branchData: Record<string, any> = {};
      
      // Process branches with basic info
      if (branches) {
        branches.forEach((branch: any) => {
          branchData[branch.branch_id] = {
            name: branch.name,
            address: branch.address,
            chainName: branch.store_chains?.name ? normalizeChainName(branch.store_chains.name) : '',
            logoUrl: branch.store_chains?.logo_url
          };
        });
      }
      
      // Enhance with mapping info if available
      if (mappings) {
        mappings.forEach((mapping: any) => {
          const normalizedChain = normalizeChainName(mapping.source_chain);
          
          // If we already have this branch, enhance it
          if (branchData[mapping.source_branch_id]) {
            branchData[mapping.source_branch_id] = {
              ...branchData[mapping.source_branch_id],
              name: mapping.source_branch_name || branchData[mapping.source_branch_id].name,
              chainName: normalizedChain || branchData[mapping.source_branch_id].chainName
            };
          } else {
            // Create new entry if not exists
            branchData[mapping.source_branch_id] = {
              name: mapping.source_branch_name,
              address: '',
              chainName: normalizedChain,
              logoUrl: null
            };
          }
        });
      }
      
      return branchData;
    },
    enabled: storeIds.length > 0
  });
};
