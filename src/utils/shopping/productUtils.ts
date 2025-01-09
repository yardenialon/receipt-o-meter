import { Product, ShoppingListItem, StoreComparison } from "@/types/shopping";

export const groupProductsByStore = (products: Product[]): Record<string, StoreComparison> => {
  return products.reduce<Record<string, StoreComparison>>((acc, product) => {
    if (!product.branch_mappings) return acc;

    const mapping = product.branch_mappings;
    const storeBranch = mapping.store_branches;
    const storeKey = `${mapping.source_chain}-${mapping.source_branch_id}`;

    if (!acc[storeKey]) {
      acc[storeKey] = {
        storeName: mapping.source_chain,
        storeId: mapping.source_branch_id,
        branchName: mapping.source_branch_name || 
          (storeBranch && 
           typeof storeBranch === 'object' && 
           'name' in storeBranch && 
           storeBranch.name !== null ? 
           storeBranch.name : 
           null),
        branchAddress: storeBranch && 
          typeof storeBranch === 'object' && 
          'address' in storeBranch && 
          storeBranch.address !== null ? 
          storeBranch.address : 
          null,
        items: [],
        total: 0,
        availableItemsCount: 0
      };
    }
    acc[storeKey].products = acc[storeKey].products || [];
    acc[storeKey].products.push(product);
    return acc;
  }, {});
};

export const findMatchingProducts = (
  productMatches: Array<{ product_code: string; product_name: string }>,
  item: ShoppingListItem
) => {
  return productMatches.filter(match => 
    match.product_name.toLowerCase().includes(item.name.toLowerCase())
  );
};

export const processStoreComparisons = (
  productsByStore: Record<string, StoreComparison>,
  activeItems: ShoppingListItem[],
  productMatches: Array<{ product_code: string; product_name: string }>
): StoreComparison[] => {
  return Object.values(productsByStore).map(store => {
    const comparison: StoreComparison = {
      ...store,
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

    comparison.items.forEach((item, index) => {
      const matchingProductCodes = findMatchingProducts(productMatches, { name: item.name })
        .map(match => match.product_code);
      
      const matchingProducts = store.products.filter(p => 
        matchingProductCodes.includes(p.product_code)
      );

      if (matchingProducts.length > 0) {
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
};