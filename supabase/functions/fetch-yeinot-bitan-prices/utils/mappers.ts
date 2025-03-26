
/**
 * Maps product data from the API to our database structure
 */
export const mapProductData = (product: any, store: any) => {
  // Normalize chain name to ensure consistent storage
  const normalizedChainName = 'יינות ביתן';
  
  // Convert numeric values safely
  const price = typeof product.price === 'string' 
    ? parseFloat(product.price) 
    : (typeof product.price === 'number' ? product.price : 0);
  
  // Handle different date formats or create a new date if none exists
  const updateDate = new Date().toISOString();

  return {
    store_chain: normalizedChainName,
    store_id: store.id || '001',
    product_code: product.code,
    product_name: product.name,
    manufacturer: product.manufacturer || '',
    price: price,
    unit_quantity: product.quantity || '',
    unit_of_measure: product.unit || '',
    category: product.category || 'כללי',
    price_update_date: updateDate,
    // Additional fields that might be useful
    item_type: product.type || null,
    manufacture_country: product.country || null,
    manufacturer_item_description: product.description || null,
    quantity: typeof product.qty === 'number' ? product.qty : 1,
    is_weighted: product.is_weighted === true
  };
};
