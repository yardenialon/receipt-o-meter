
import { supabase } from '@/lib/supabase';
import { ShoppingListItem, Product } from '@/types/shopping';

// Function to search products by product code
export const searchProductsByCode = async (productCodes: string[]): Promise<Product[]> => {
  console.log('Searching for products with codes:', productCodes);
  
  const { data: productsByCode, error: codeError } = await supabase
    .from('store_products')
    .select(`
      product_code,
      product_name,
      price,
      store_chain,
      store_id,
      branch_mapping_id,
      branch_mappings (
        source_chain,
        source_branch_id,
        source_branch_name
      )
    `)
    .in('product_code', productCodes);

  if (codeError) {
    console.error('Error fetching products by code:', codeError);
    return [];
  }
  
  if (productsByCode && productsByCode.length > 0) {
    console.log(`Found ${productsByCode.length} products by code`);
    
    // Log chains found
    const chains = new Set(productsByCode.map(product => product.store_chain));
    console.log('Chains found for product codes:', [...chains]);
    
    // Debug price info for each product code
    productCodes.forEach(code => {
      const productsWithCode = productsByCode.filter(p => p.product_code === code);
      if (productsWithCode.length > 0) {
        console.log(`Product ${code} found in ${productsWithCode.length} stores:`);
        const productsByChain = productsWithCode.reduce((acc, p) => {
          if (!acc[p.store_chain]) acc[p.store_chain] = [];
          acc[p.store_chain].push(p);
          return acc;
        }, {} as Record<string, any[]>);
        
        Object.entries(productsByChain).forEach(([chain, prods]) => {
          console.log(`  ${chain}: ${prods.length} products, prices: ${prods.map(p => p.price).join(', ')}`);
        });
      }
    });
  }
  
  return productsByCode || [];
};

// Function to search products by name term
export const searchProductsByName = async (searchTerm: string): Promise<Product[]> => {
  console.log(`Searching for products with name containing: "${searchTerm}"`);
  
  const { data: productsByName, error: nameError } = await supabase
    .from('store_products')
    .select(`
      product_code,
      product_name,
      price,
      store_chain,
      store_id,
      branch_mapping_id,
      branch_mappings (
        source_chain,
        source_branch_id,
        source_branch_name
      )
    `)
    .ilike('product_name', `%${searchTerm}%`)
    .limit(500);
  
  if (nameError) {
    console.error(`Error fetching products for term "${searchTerm}":`, nameError);
    return [];
  }
  
  if (productsByName && productsByName.length > 0) {
    // Log chains where products were found
    const storeChains = [...new Set(productsByName.map(p => p.store_chain))];
    console.log(`Found ${productsByName.length} products for term "${searchTerm}" in chains:`, storeChains);
    
    // Debug price info for each chain
    const productsByChain = productsByName.reduce((acc, p) => {
      if (!acc[p.store_chain]) acc[p.store_chain] = [];
      acc[p.store_chain].push(p);
      return acc;
    }, {} as Record<string, any[]>);
    
    Object.entries(productsByChain).forEach(([chain, prods]) => {
      console.log(`  ${chain}: ${prods.length} products, example prices: ${prods.slice(0, 3).map(p => p.price).join(', ')}...`);
    });
    
    return productsByName;
  }
  
  return [];
};

// Fallback search for individual words when full term returns no results
export const searchProductsByWords = async (searchTerm: string): Promise<Product[]> => {
  const words = searchTerm.split(/\s+/).filter(word => word.length > 3);
  let results: Product[] = [];
  
  for (const word of words) {
    const { data: productsByWord, error: wordError } = await supabase
      .from('store_products')
      .select(`
        product_code,
        product_name,
        price,
        store_chain,
        store_id,
        branch_mapping_id,
        branch_mappings (
          source_chain,
          source_branch_id,
          source_branch_name
        )
      `)
      .ilike('product_name', `%${word}%`)
      .limit(300);
    
    if (!wordError && productsByWord && productsByWord.length > 0) {
      console.log(`Found ${productsByWord.length} products for word "${word}"`);
      results.push(...productsByWord);
    }
  }
  
  return results;
};

// Main search function that combines all search methods
export const searchProducts = async (items: ShoppingListItem[]): Promise<Product[]> => {
  if (!items.length) return [];
  
  // Split items by those with product codes and those without
  const itemsWithProductCode = items.filter(item => item.product_code);
  const productCodes = itemsWithProductCode.map(item => item.product_code).filter(Boolean) as string[];
  
  const itemsWithoutProductCode = items.filter(item => !item.product_code);
  const nameSearchTerms = itemsWithoutProductCode.map(item => item.name.toLowerCase().trim());
  
  let products: Product[] = [];
  
  // Search by product codes if we have any
  if (productCodes.length > 0) {
    const codeProducts = await searchProductsByCode(productCodes);
    products = [...codeProducts];
  }

  // Search by name for items without product codes
  if (nameSearchTerms.length > 0) {
    const nameProducts: Product[] = [];
    
    for (const searchTerm of nameSearchTerms) {
      // Try exact name search first
      let termProducts = await searchProductsByName(searchTerm);
      
      // If no results, try searching by individual words
      if (termProducts.length === 0) {
        console.log(`No products found for term "${searchTerm}", trying word search`);
        termProducts = await searchProductsByWords(searchTerm);
      }
      
      nameProducts.push(...termProducts);
    }
    
    if (nameProducts.length > 0) {
      // Log chains where products were found
      const nameChains = new Set(nameProducts.map(product => product.store_chain));
      console.log('Chains found for name search:', [...nameChains]);
      
      // Remove duplicates when combining with code products
      const existingProductsMap = new Map(
        products.map(product => [`${product.product_code}-${product.store_chain}-${product.store_id}`, product])
      );
      
      for (const product of nameProducts) {
        const key = `${product.product_code}-${product.store_chain}-${product.store_id}`;
        if (!existingProductsMap.has(key)) {
          existingProductsMap.set(key, product);
        }
      }
      
      products = Array.from(existingProductsMap.values());
      console.log(`Total combined unique products: ${products.length}`);
    }
  }
  
  return products;
};

// Function to create debug logs about the products found
export const logProductDebugInfo = (products: Product[]): void => {
  if (!products.length) {
    console.log('No matching products found');
    return;
  }
  
  // Log products by store chain
  const storeChains = [...new Set(products.map(product => 
    product.store_chain || ''))];
  console.log('Found products in these chains:', storeChains);
  
  // Log product counts and price ranges by chain
  storeChains.forEach(chain => {
    const chainProducts = products.filter(product => 
      product.store_chain === chain);
    console.log(`Chain ${chain}: ${chainProducts.length} products`);
    
    // Check price ranges
    if (chainProducts.length > 0) {
      const prices = chainProducts.map(p => p.price).filter(Boolean).sort((a, b) => a - b);
      if (prices.length > 0) {
        console.log(`  Price range for ${chain}: ${prices[0]} - ${prices[prices.length - 1]}`);
      }
    }
  });
};
