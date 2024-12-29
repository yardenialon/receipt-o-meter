export function mapProductData(item: any) {
  if (!item) return null;

  try {
    // Handle different date formats
    let priceUpdateDate;
    try {
      const dateStr = item.PriceUpdateDate || new Date().toISOString();
      priceUpdateDate = new Date(dateStr.replace(' ', 'T'));
    } catch {
      priceUpdateDate = new Date();
    }

    const product = {
      store_chain: String(item.ChainName || '').trim(),
      store_id: String(item.StoreId || '').trim(),
      product_code: String(item.ItemCode || '').trim(),
      product_name: String(item.ItemName || '').trim(),
      manufacturer: String(item.ManufacturerName || '').trim(),
      price: parseFloat(String(item.ItemPrice || '0')),
      unit_quantity: String(item.UnitQty || '').trim(),
      unit_of_measure: String(item.UnitOfMeasure || '').trim(),
      category: String(item.ItemSection || 'כללי').trim(),
      price_update_date: priceUpdateDate.toISOString()
    };

    // Validate required fields
    if (!product.product_code || !product.product_name || isNaN(product.price) || product.price <= 0) {
      console.warn('Invalid product data:', {
        code: product.product_code,
        name: product.product_name,
        price: product.price
      });
      return null;
    }

    return product;
  } catch (error) {
    console.error('Error mapping product:', error);
    return null;
  }
}