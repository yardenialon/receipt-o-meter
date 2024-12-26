import { XmlProduct } from './types.ts';

// Helper function to safely get value with multiple possible keys
const getValue = (item: any, keys: string[]): string => {
  if (!item) return '';
  
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null) {
      const value = String(item[key]).trim();
      if (value) return value;
    }
  }
  return '';
};

// Helper function to safely parse price
const parsePrice = (priceStr: string): number => {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Function to get items array from various possible XML structures
const getItemsArray = (parsedXml: any): any[] => {
  if (!parsedXml) return [];
  
  // Common XML structures to check
  const possiblePaths = [
    parsedXml.root?.Items?.Item,
    parsedXml.Items?.Item,
    parsedXml.PriceFull?.Items?.Item,
    parsedXml.root?.PriceList?.Items?.Item,
    parsedXml.PriceList?.Items?.Item
  ];

  for (const path of possiblePaths) {
    if (path) {
      return Array.isArray(path) ? path : [path];
    }
  }

  // Deep search for items if not found in common paths
  const findItems = (obj: any): any[] => {
    if (!obj || typeof obj !== 'object') return [];
    
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'Item' || key === 'Items') {
        return Array.isArray(value) ? value : [value];
      }
      if (typeof value === 'object') {
        const found = findItems(value);
        if (found.length > 0) return found;
      }
    }
    return [];
  };

  return findItems(parsedXml);
};

export const parseXmlItems = (parsedXml: any): XmlProduct[] => {
  console.log('Starting XML parsing...');
  
  const items = getItemsArray(parsedXml);
  console.log(`Found ${items.length} potential items`);
  
  if (!items.length) {
    throw new Error('לא נמצאו פריטים ב-XML');
  }

  return items
    .filter(item => item !== null && typeof item === 'object')
    .map(item => {
      try {
        const product: XmlProduct = {
          store_chain: getValue(item, ['StoreChain', 'Chain', 'StoreName']),
          store_id: getValue(item, ['StoreId', 'BranchId', 'StoreNumber']),
          product_code: getValue(item, ['ItemCode', 'PriceCode', 'Code', 'id']),
          product_name: getValue(item, ['ItemName', 'PriceName', 'Name', 'description']),
          manufacturer: getValue(item, ['ManufacturerName', 'Manufacturer', 'manufacturer']) || null,
          price: parsePrice(getValue(item, ['ItemPrice', 'Price', 'price'])),
          unit_quantity: getValue(item, ['Quantity', 'UnitQty', 'quantity']) || null,
          unit_of_measure: getValue(item, ['UnitOfMeasure', 'Unit', 'unit']) || null,
          category: getValue(item, ['ItemSection', 'Category', 'category']) || null,
          price_update_date: new Date().toISOString()
        };

        // Validate required fields
        if (!product.product_code || !product.product_name || product.price <= 0) {
          console.warn('Invalid product:', product);
          return null;
        }

        return product;
      } catch (error) {
        console.error('Error processing item:', error);
        return null;
      }
    })
    .filter((product): product is XmlProduct => product !== null);
};