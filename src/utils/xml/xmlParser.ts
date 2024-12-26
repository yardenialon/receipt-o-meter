export const parseXmlContent = async (xmlText: string) => {
  console.log('Starting XML parsing with content length:', xmlText.length);
  
  // Clean up XML content
  const cleanXml = xmlText
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(cleanXml, 'text/xml');
  
  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    console.error('XML parsing error:', parserError.textContent);
    throw new Error('קובץ ה-XML אינו תקין. שגיאת פרסור: ' + parserError.textContent);
  }

  // Get items from Rami Levy's XML structure
  const items = xmlDoc.querySelectorAll('Items > Item');
  
  if (!items || items.length === 0) {
    console.error('No items found in XML');
    throw new Error('לא נמצאו פריטים בקובץ ה-XML');
  }

  console.log(`Found ${items.length} items in XML`);
  return Array.from(items);
};

export const parseXmlItems = (items: Element[]) => {
  console.log('Starting to parse XML items...');
  
  return items.map((item, index) => {
    try {
      // Helper function to safely get text content
      const getElementText = (parent: Element, tagName: string): string => {
        const element = parent.querySelector(tagName);
        return element?.textContent?.trim() || '';
      };

      const priceUpdateDate = new Date(getElementText(item, 'PriceUpdateDate'));
      
      const product = {
        store_chain: 'רמי לוי',
        store_id: getElementText(item, 'StoreId') || '001',
        product_code: getElementText(item, 'ItemCode'),
        product_name: getElementText(item, 'ItemName'),
        manufacturer: getElementText(item, 'ManufacturerName'),
        price: parseFloat(getElementText(item, 'ItemPrice')) || 0,
        unit_quantity: getElementText(item, 'UnitQty'),
        unit_of_measure: getElementText(item, 'UnitOfMeasure'),
        category: 'כללי', // Default category since Rami Levy XML doesn't include categories
        price_update_date: priceUpdateDate.toISOString()
      };

      // Validate required fields
      if (!product.product_code) {
        console.error(`Missing product code for item ${index + 1}`);
        throw new Error(`חסר קוד מוצר בפריט ${index + 1}`);
      }

      if (!product.product_name) {
        console.error(`Missing product name for item ${index + 1}`);
        throw new Error(`חסר שם מוצר בפריט ${index + 1}`);
      }

      if (isNaN(product.price) || product.price < 0) {
        console.error(`Invalid price for item ${index + 1}: ${product.price}`);
        throw new Error(`מחיר לא תקין בפריט ${index + 1}`);
      }

      return product;
    } catch (error) {
      console.error(`Error parsing item ${index + 1}:`, error);
      throw new Error(`שגיאה בפרסור פריט ${index + 1}: ${error.message}`);
    }
  });
};