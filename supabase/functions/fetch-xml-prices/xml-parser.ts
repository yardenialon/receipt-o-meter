export const parseXmlItems = (parsedXml: any) => {
  console.log('Starting XML parsing...');
  
  if (!parsedXml) {
    console.error('Parsed XML is null');
    throw new Error('Invalid XML structure');
  }

  // Helper function to safely get nested value
  const safeGet = (obj: any, path: string[]): any => {
    try {
      let current = obj;
      for (const key of path) {
        if (current === null || current === undefined) return null;
        current = current[key];
      }
      return current;
    } catch (error) {
      console.error(`Error getting path ${path.join('.')}:`, error);
      return null;
    }
  };

  // Find items array in common XML structures
  const findItems = (obj: any): any[] => {
    const commonPaths = [
      ['Items', 'Item'],
      ['PriceFull', 'Items', 'Item'],
      ['Products', 'Product'],
      ['Item'],
      ['Product']
    ];

    for (const path of commonPaths) {
      const items = safeGet(obj, path);
      if (Array.isArray(items)) {
        console.log(`Found items array at path: ${path.join('.')}`);
        return items;
      }
      if (items && typeof items === 'object') {
        console.log(`Found single item at path: ${path.join('.')}`);
        return [items];
      }
    }

    // If not found in common paths, try to find in root
    if (Array.isArray(obj)) {
      console.log('Found items array in root');
      return obj;
    }
    if (obj && typeof obj === 'object') {
      console.log('Found single item in root');
      return [obj];
    }

    console.error('No items found in XML structure');
    throw new Error('לא נמצאו פריטים ב-XML');
  };

  const items = findItems(parsedXml);
  console.log(`Found ${items.length} potential items`);

  return items
    .map((item, index) => {
      try {
        console.log(`Processing item ${index + 1}:`, JSON.stringify(item).substring(0, 200));

        // Helper function to get value with multiple possible keys
        const getValue = (keys: string[]): string => {
          for (const key of keys) {
            const value = safeGet(item, [key]);
            if (value) return String(value).trim();
          }
          return '';
        };

        const product = {
          store_chain: '',  // Will be set later
          store_id: '',     // Will be set later
          product_code: getValue(['ItemCode', 'PriceCode', 'Code', 'id', 'ProductCode']),
          product_name: getValue(['ItemName', 'PriceName', 'Name', 'ProductName', 'description']),
          manufacturer: getValue(['ManufacturerName', 'Manufacturer', 'manufacturer', 'Producer']),
          price: parseFloat(getValue(['ItemPrice', 'Price', 'price', 'UnitPrice'])) || 0,
          unit_quantity: getValue(['Quantity', 'UnitQty', 'quantity', 'Amount']),
          unit_of_measure: getValue(['UnitOfMeasure', 'Unit', 'unit', 'MeasureUnit']),
          category: getValue(['ItemSection', 'Category', 'category', 'Department']) || 'אחר',
          price_update_date: new Date().toISOString()
        };

        // Validate required fields
        if (!product.product_code || !product.product_name || product.price <= 0) {
          console.warn('Invalid product:', product);
          return null;
        }

        console.log('Successfully parsed product:', {
          code: product.product_code,
          name: product.product_name,
          price: product.price
        });

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
};