export const parseXmlItems = (parsedXml: any) => {
  console.log('Starting XML parsing...');
  
  if (!parsedXml) {
    console.error('Parsed XML is null or undefined');
    throw new Error('Invalid XML structure: XML content is empty');
  }

  // Log the XML structure for debugging
  console.log('XML structure type:', typeof parsedXml);
  console.log('XML structure:', JSON.stringify(parsedXml, null, 2));

  // Helper function to safely get nested value
  const safeGet = (obj: any, path: string[]): any => {
    if (!obj) {
      console.log(`Object is null or undefined when trying to access path: ${path.join('.')}`);
      return null;
    }

    try {
      let current = obj;
      for (const key of path) {
        if (current === null || current === undefined) {
          console.log(`Null/undefined encountered at path: ${path.join('.')} at key: ${key}`);
          return null;
        }
        current = current[key];
      }
      return current;
    } catch (error) {
      console.error(`Error getting path ${path.join('.')}:`, error);
      return null;
    }
  };

  // Helper function to find items array in XML structure
  const findItems = (obj: any): any[] => {
    if (!obj) {
      console.error('Object is null in findItems');
      return [];
    }

    // Common paths where items might be found
    const commonPaths = [
      ['root', 'Items', 'Item'],
      ['root', 'PriceFull', 'Items', 'Item'],
      ['root', 'Products', 'Product'],
      ['Items', 'Item'],
      ['PriceFull', 'Items', 'Item'],
      ['Products', 'Product'],
      ['Item'],
      ['Product']
    ];

    // Try each common path
    for (const path of commonPaths) {
      console.log(`Trying path: ${path.join('.')}`);
      const items = safeGet(obj, path);
      
      if (Array.isArray(items)) {
        console.log(`Found items array at path: ${path.join('.')} with ${items.length} items`);
        return items;
      }
      
      if (items && typeof items === 'object') {
        console.log(`Found single item at path: ${path.join('.')}`);
        return [items];
      }
    }

    // If not found in common paths, try to find in root
    if (Array.isArray(obj)) {
      console.log(`Found items array in root with ${obj.length} items`);
      return obj;
    }
    
    if (obj && typeof obj === 'object') {
      // Try to find any array in the object that might contain items
      for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (Array.isArray(value)) {
          console.log(`Found potential items array in key: ${key} with ${value.length} items`);
          return value;
        }
      }
      
      // If we found a single object, return it as an array
      if (Object.keys(obj).length > 0) {
        console.log('Found single item in root');
        return [obj];
      }
    }

    console.error('No items found in XML structure');
    return [];
  };

  const items = findItems(parsedXml);
  
  if (items.length === 0) {
    console.error('No items found in XML');
    throw new Error('לא נמצאו פריטים ב-XML');
  }

  console.log(`Found ${items.length} potential items`);
  if (items[0]) {
    console.log('First item structure:', JSON.stringify(items[0], null, 2));
  }

  const validProducts = items
    .map((item, index) => {
      if (!item) {
        console.log(`Skipping null item at index ${index}`);
        return null;
      }

      try {
        console.log(`Processing item ${index + 1}:`, JSON.stringify(item));

        // Helper function to get value with multiple possible keys
        const getValue = (keys: string[]): string => {
          for (const key of keys) {
            const value = safeGet(item, [key]);
            if (value) {
              console.log(`Found value for ${keys[0]} using key: ${key}`);
              return String(value).trim();
            }
          }
          return '';
        };

        const product = {
          store_chain: '',  // Will be set later
          store_id: '',     // Will be set later
          product_code: getValue(['ItemCode', 'PriceCode', 'Code', 'id', 'ProductCode', 'barcode', 'Barcode']),
          product_name: getValue(['ItemName', 'PriceName', 'Name', 'ProductName', 'description', 'Description']),
          manufacturer: getValue(['ManufacturerName', 'Manufacturer', 'manufacturer', 'Producer', 'Company']),
          price: parseFloat(getValue(['ItemPrice', 'Price', 'price', 'UnitPrice', 'RetailPrice'])) || 0,
          unit_quantity: getValue(['Quantity', 'UnitQty', 'quantity', 'Amount']),
          unit_of_measure: getValue(['UnitOfMeasure', 'Unit', 'unit', 'MeasureUnit']),
          category: getValue(['ItemSection', 'Category', 'category', 'Department']) || 'אחר',
          price_update_date: new Date().toISOString()
        };

        // Log the extracted product
        console.log(`Extracted product ${index + 1}:`, product);

        // Validate required fields
        if (!product.product_code) {
          console.warn(`Missing product code for item ${index + 1}`);
          return null;
        }

        if (!product.product_name) {
          console.warn(`Missing product name for item ${index + 1}`);
          return null;
        }

        if (product.price <= 0) {
          console.warn(`Invalid price for item ${index + 1}: ${product.price}`);
          return null;
        }

        return product;
      } catch (error) {
        console.error(`Error processing item ${index + 1}:`, error);
        return null;
      }
    })
    .filter((product): product is NonNullable<typeof product> => {
      if (!product) {
        console.log('Filtering out null product');
        return false;
      }
      return true;
    });

  if (validProducts.length === 0) {
    throw new Error('לא נמצאו מוצרים תקינים ב-XML');
  }

  console.log(`Found ${validProducts.length} valid products`);
  return validProducts;
};