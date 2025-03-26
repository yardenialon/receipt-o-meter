
/**
 * Maps product data from the API to our database structure
 */
export const mapProductData = (product: any, store: any) => {
  return {
    store_chain: 'יינות ביתן',
    store_id: store.id,
    product_code: product.code,
    product_name: product.name,
    manufacturer: product.manufacturer || '',
    price: parseFloat(product.price) || 0,
    unit_quantity: product.quantity || '',
    unit_of_measure: product.unit || '',
    category: product.category || 'כללי',
    price_update_date: new Date().toISOString()
  };
};
