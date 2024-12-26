import { XmlProduct } from "./types.ts";

export const parseXmlItems = (items: any[]): XmlProduct[] => {
  console.log('Starting to parse XML items...');
  
  return items
    .map((item, index) => {
      try {
        if (!item.ItemCode || !item.ItemName || !item.ItemPrice) {
          console.warn(`Invalid item at index ${index}, missing required fields`);
          return null;
        }

        const product: XmlProduct = {
          store_chain: '',  // Will be set by the caller
          store_id: '',     // Will be set by the caller
          product_code: String(item.ItemCode).trim(),
          product_name: String(item.ItemName).trim(),
          manufacturer: item.ManufacturerName ? String(item.ManufacturerName).trim() : null,
          price: parseFloat(item.ItemPrice) || 0,
          unit_quantity: item.UnitQty ? String(item.UnitQty).trim() : null,
          unit_of_measure: item.UnitOfMeasure ? String(item.UnitOfMeasure).trim() : null,
          category: item.Category ? String(item.Category).trim() : 'כללי',
          price_update_date: item.PriceUpdateDate ? new Date(item.PriceUpdateDate).toISOString() : new Date().toISOString()
        };

        // Validate required fields
        if (!product.product_code) {
          throw new Error(`Missing product code for item ${index + 1}`);
        }

        if (!product.product_name) {
          throw new Error(`Missing product name for item ${index + 1}`);
        }

        if (isNaN(product.price) || product.price < 0) {
          throw new Error(`Invalid price for item ${index + 1}: ${product.price}`);
        }

        return product;
      } catch (error) {
        console.error(`Error parsing item ${index + 1}:`, error);
        return null;
      }
    })
    .filter((product): product is XmlProduct => product !== null);
};