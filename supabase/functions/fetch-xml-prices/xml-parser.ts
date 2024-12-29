import { XmlProduct } from "./types.ts";

const safeGetValue = (item: any, key: string): string => {
  if (!item || typeof item !== 'object') {
    console.warn(`Invalid item for key ${key}`);
    return '';
  }
  
  const value = item[key];
  if (value === null || value === undefined) {
    console.warn(`Null or undefined value for key ${key}`);
    return '';
  }
  
  return String(value).trim();
};

const safeParseFloat = (value: string): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

export const parseXmlItems = (items: any[]): XmlProduct[] => {
  console.log('Starting to parse XML items...');
  
  if (!Array.isArray(items)) {
    console.error('Items is not an array');
    return [];
  }

  return items
    .map((item, index) => {
      try {
        if (!item || typeof item !== 'object') {
          console.warn(`Invalid item at index ${index}`);
          return null;
        }

        const productCode = safeGetValue(item, 'ItemCode');
        const productName = safeGetValue(item, 'ItemName');
        const priceStr = safeGetValue(item, 'ItemPrice');
        const price = safeParseFloat(priceStr);

        // Validate required fields
        if (!productCode) {
          console.warn(`Missing product code for item ${index}`);
          return null;
        }

        if (!productName) {
          console.warn(`Missing product name for item ${index}`);
          return null;
        }

        if (price <= 0) {
          console.warn(`Invalid price for item ${index}: ${price}`);
          return null;
        }

        const product: XmlProduct = {
          store_chain: '',  // Will be set by the caller
          store_id: '',     // Will be set by the caller
          product_code: productCode,
          product_name: productName,
          manufacturer: safeGetValue(item, 'ManufacturerName'),
          price: price,
          unit_quantity: safeGetValue(item, 'UnitQty'),
          unit_of_measure: safeGetValue(item, 'UnitOfMeasure'),
          category: safeGetValue(item, 'ItemSection') || 'כללי',
          price_update_date: new Date().toISOString()
        };

        return product;
      } catch (error) {
        console.error(`Error parsing item ${index}:`, error);
        return null;
      }
    })
    .filter((product): product is XmlProduct => 
      product !== null && 
      typeof product === 'object' &&
      typeof product.product_code === 'string' &&
      product.product_code !== '' &&
      typeof product.product_name === 'string' &&
      product.product_name !== '' &&
      typeof product.price === 'number' &&
      product.price > 0
    );
};