import { XmlProduct } from './types.ts';

const safeGetText = (element: any, path: string[]): string => {
  console.log(`Attempting to get text for path: ${path.join('.')}`);
  try {
    let current = element;
    for (const key of path) {
      if (!current?.[key]) {
        console.log(`Path ${path.join('.')} not found at key: ${key}`);
        return '';
      }
      current = current[key];
    }
    const result = String(current || '').trim();
    console.log(`Found value: ${result}`);
    return result;
  } catch (error) {
    console.error(`Error getting text for path ${path.join('.')}:`, error);
    return '';
  }
};

const safeParseNumber = (value: string): number => {
  try {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  } catch {
    return 0;
  }
};

const findItemsInXml = (obj: any, depth = 0, maxDepth = 5): any[] => {
  console.log(`Searching for items at depth ${depth}`);
  
  if (depth >= maxDepth || !obj || typeof obj !== 'object') {
    return [];
  }

  // Common paths where items might be found
  const itemPaths = ['Items.Item', 'root.Items.Item', 'PriceFull.Items.Item'];
  
  for (const path of itemPaths) {
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      current = current?.[part];
      if (!current) break;
    }
    if (current) {
      const items = Array.isArray(current) ? current : [current];
      console.log(`Found ${items.length} items in path ${path}`);
      return items;
    }
  }

  // Recursive search if not found in common paths
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'Item' || key === 'Items') {
      const items = Array.isArray(value) ? value : [value];
      console.log(`Found ${items.length} items in key ${key}`);
      return items;
    }
    if (typeof value === 'object') {
      const found = findItemsInXml(value, depth + 1, maxDepth);
      if (found.length > 0) return found;
    }
  }

  return [];
};

export const parseXmlItems = (parsedXml: any): XmlProduct[] => {
  console.log('Starting XML parsing...');
  
  if (!parsedXml) {
    console.error('Parsed XML is null');
    throw new Error('Invalid XML structure');
  }

  const items = findItemsInXml(parsedXml);
  console.log(`Found ${items.length} potential items`);
  
  if (!items.length) {
    console.error('No items found in XML structure');
    throw new Error('לא נמצאו פריטים ב-XML');
  }

  return items
    .filter(item => {
      if (!item) {
        console.log('Skipping null item');
        return false;
      }
      console.log('Processing item:', item);
      return true;
    })
    .map((item, index) => {
      try {
        console.log(`Processing item ${index + 1}`);
        
        const product: XmlProduct = {
          store_chain: '',  // Will be set later
          store_id: '',     // Will be set later
          product_code: safeGetText(item, ['ItemCode', 'PriceCode', 'Code', 'id']),
          product_name: safeGetText(item, ['ItemName', 'PriceName', 'Name', 'description']),
          manufacturer: safeGetText(item, ['ManufacturerName', 'Manufacturer', 'manufacturer']),
          price: safeParseNumber(safeGetText(item, ['ItemPrice', 'Price', 'price'])),
          unit_quantity: safeGetText(item, ['Quantity', 'UnitQty', 'quantity']),
          unit_of_measure: safeGetText(item, ['UnitOfMeasure', 'Unit', 'unit']),
          category: safeGetText(item, ['ItemSection', 'Category', 'category']),
          price_update_date: new Date().toISOString()
        };

        console.log('Processed product:', {
          code: product.product_code,
          name: product.product_name,
          price: product.price
        });

        if (!product.product_code || !product.product_name || product.price <= 0) {
          console.warn('Invalid product:', product);
          return null;
        }

        return product;
      } catch (error) {
        console.error(`Error processing item ${index + 1}:`, error);
        return null;
      }
    })
    .filter((product): product is XmlProduct => {
      if (!product) {
        console.log('Filtering out null product');
        return false;
      }
      return true;
    });
};