import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface ShoppingListItem {
  name: string;
  is_completed?: boolean;
  quantity?: number;
}

interface StoreBranch {
  name: string | null;
  address: string | null;
}

interface BranchMapping {
  source_chain: string;
  source_branch_id: string;
  source_branch_name: string | null;
  store_branches?: {
    name: string | null;
    address: string | null;
  } | null;
}

interface Product {
  branch_mappings: BranchMapping;
  product_code: string;
  product_name: string;
  price: number;
}

export const useShoppingListPrices = (items: ShoppingListItem[] = []) => {
  return useQuery({
    queryKey: ['shopping-list-prices', items.map(i => `${i.name}-${i.quantity || 1}`).join(',')],
    queryFn: async () => {
      if (!items.length) return [];

      const activeItems = items.filter(item => !item.is_completed);
      if (!activeItems.length) return [];

      console.log('Active items to compare:', activeItems);

      // First, get the product codes for our items by searching by name
      const { data: productMatches, error: matchError } = await supabase
        .from('store_products')
        .select('product_code, product_name')
        .or(activeItems.map(item => `product_name.ilike.%${item.name}%`).join(','));

      if (matchError) {
        console.error('Error finding item matches:', matchError);
        throw matchError;
      }

      if (!productMatches?.length) {
        console.log('No matching products found');
        return [];
      }

      // Get unique product codes
      const productCodes = [...new Set(productMatches.map(match => match.product_code))];
      console.log('Found product codes:', productCodes);

      // Get all store products with these product codes
      const { data: products, error } = await supabase
        .from('store_products')
        .select(`
          product_code,
          product_name,
          price,
          branch_mappings (
            source_chain,
            source_branch_id,
            source_branch_name,
            store_branches (
              name,
              address
            )
          )
        `)
        .in('product_code', productCodes);

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      if (!products?.length) {
        console.log('No products found in database');
        return [];
      }

      console.log('Found products with mappings:', products);

      // Group products by store
      const productsByStore = products.reduce<Record<string, {
        storeName: string;
        storeId: string;
        branchName: string | null;
        branchAddress: string | null;
        products: typeof products;
      }>>((acc, product) => {
        if (!product.branch_mappings) return acc;

        const mapping = product.branch_mappings;
        const storeBranch = mapping.store_branches;
        const storeKey = `${mapping.source_chain}-${mapping.source_branch_id}`;

        if (!acc[storeKey]) {
          acc[storeKey] = {
            storeName: mapping.source_chain,
            storeId: mapping.source_branch_id,
            branchName: mapping.source_branch_name || (storeBranch && 'name' in storeBranch ? storeBranch.name : null),
            branchAddress: (storeBranch && 'address' in storeBranch ? storeBranch.address : null),
            products: []
          };
        }
        acc[storeKey].products.push(product);
        return acc;
      }, {});

      // Process each store's comparison
      const allStoreComparisons = Object.values(productsByStore).map(store => {
        const comparison = {
          storeName: store.storeName,
          storeId: store.storeId,
          branchName: store.branchName,
          branchAddress: store.branchAddress,
          items: activeItems.map(item => ({
            name: item.name,
            price: null,
            matchedProduct: '',
            quantity: item.quantity || 1,
            isAvailable: false
          })),
          total: 0,
          availableItemsCount: 0
        };

        // For each item in our list, find matching products by product code
        comparison.items.forEach((item, index) => {
          // Find matching products for this item
          const itemMatches = productMatches.filter(match => 
            match.product_name.toLowerCase().includes(item.name.toLowerCase())
          );
          const matchingProductCodes = itemMatches.map(match => match.product_code);
          
          // Find all products in this store with matching product codes
          const matchingProducts = store.products.filter(p => 
            matchingProductCodes.includes(p.product_code)
          );

          if (matchingProducts.length > 0) {
            // If we have multiple matches, use the cheapest one
            const cheapestProduct = matchingProducts.reduce((min, p) => 
              p.price < min.price ? p : min
            , matchingProducts[0]);

            comparison.items[index] = {
              ...item,
              price: cheapestProduct.price,
              matchedProduct: cheapestProduct.product_name,
              isAvailable: true
            };
            comparison.total += cheapestProduct.price * item.quantity;
            comparison.availableItemsCount++;
          }
        });

        return comparison;
      });

      // Include all stores that have at least one item available
      const storesWithItems = allStoreComparisons.filter(store => 
        store.availableItemsCount > 0
      );

      // Sort stores: first by availability (complete baskets first), then by total price
      const sortedComparisons = storesWithItems.sort((a, b) => {
        // First, compare by whether all items are available
        const aComplete = a.availableItemsCount === activeItems.length;
        const bComplete = b.availableItemsCount === activeItems.length;
        
        if (aComplete !== bComplete) {
          return bComplete ? 1 : -1; // Complete baskets come first
        }
        
        // If both have the same availability status, sort by total price
        return a.total - b.total;
      });

      console.log('Final sorted comparisons:', sortedComparisons);
      
      return sortedComparisons;
    },
    enabled: items.length > 0,
    refetchInterval: 60000,
    retry: 3,
    staleTime: 30000,
  });
};