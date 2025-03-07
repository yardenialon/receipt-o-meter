
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
          // Adding debug logging to track normalization
          const originalName = chain.name;
          const normalizedName = normalizeChainName(chain.name);
          console.log(`Chain: original=${originalName}, normalized=${normalizedName}`);
          
          let logoUrl = chain.logo_url;
          
          // Use standard logo path pattern if no specific URL
          if (!logoUrl) {
            const chainId = normalizedName.toLowerCase().replace(/\s+/g, '-');
            logoUrl = `/store-logos/${chainId}.png`;
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
 */
export const useStoreBranchInfo = (storeIds: string[]) => {
  return useQuery({
    queryKey: ['store-branches-full', storeIds.join(',')],
    queryFn: async () => {
      if (!storeIds.length) return {};
      
      console.log('Fetching branch info for store IDs:', storeIds);
      
      // Fetch all data before processing to avoid race conditions
      
      // First, get chain data 
      const { data: chains, error: chainError } = await supabase
        .from('store_chains')
        .select('id, name, logo_url');
        
      if (chainError) {
        console.error('Error fetching chain info:', chainError);
        return {};
      }
      
      // Then get branch data
      const { data: branches, error: branchError } = await supabase
        .from('store_branches')
        .select(`
          branch_id,
          name,
          address,
          chain_id
        `)
        .in('branch_id', storeIds);
        
      if (branchError) {
        console.error('Error fetching branch info:', branchError);
        return {};
      }
      
      // Finally get branch mappings
      const { data: mappings, error: mappingError } = await supabase
        .from('branch_mappings')
        .select('id, source_chain, source_branch_id, source_branch_name, branch_id');
        
      if (mappingError) {
        console.error('Error fetching branch mappings:', mappingError);
      }
      
      // Pre-process all chain names to avoid doing it repeatedly
      // Create lookup maps
      const chainMap = chains ? chains.reduce((map, chain) => {
        // Debug each chain to ensure correct normalization
        const originalName = chain.name;
        const normalizedName = normalizeChainName(chain.name);
        console.log(`ChainMap: ${chain.id} original=${originalName}, normalized=${normalizedName}`);
        
        map[chain.id] = { 
          name: chain.name, 
          normalizedName: normalizedName,
          logoUrl: chain.logo_url 
        };
        return map;
      }, {} as Record<string, { name: string, normalizedName: string, logoUrl: string | null }>) : {};
      
      const mappingMap = mappings ? mappings.reduce((map, mapping) => {
        map[mapping.source_branch_id] = mapping;
        return map;
      }, {} as Record<string, any>) : {};
      
      const branchData: Record<string, any> = {};
      
      if (branches) {
        branches.forEach((branch: any) => {
          const chainInfo = chainMap[branch.chain_id];
          const normalizedChain = chainInfo ? chainInfo.normalizedName : '';
          
          branchData[branch.branch_id] = {
            name: branch.name,
            address: branch.address,
            chainName: normalizedChain,
            logoUrl: chainInfo?.logoUrl
          };
        });
      }
      
      // Add data from branch mappings
      if (mappings) {
        mappings.forEach((mapping: any) => {
          if (storeIds.includes(mapping.source_branch_id)) {
            const normalizedChain = normalizeChainName(mapping.source_chain);
            console.log(`Mapping: source=${mapping.source_chain}, normalized=${normalizedChain}`);
            
            branchData[mapping.source_branch_id] = {
              name: mapping.source_branch_name,
              chainName: normalizedChain,
              // Try to find logo from chain data
              logoUrl: Object.values(chainMap).find(c => 
                c.normalizedName === normalizedChain
              )?.logoUrl
            };
          }
        });
      }
      
      return branchData;
    },
    enabled: storeIds.length > 0
  });
};
