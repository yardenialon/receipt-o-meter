export const parseXmlContent = async (xmlText: string) => {
  console.log('Starting XML parsing with content length:', xmlText.length);
  console.log('First 200 characters of XML:', xmlText.substring(0, 200));
  
  // Clean up XML content
  const cleanXml = xmlText
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

  console.log('Cleaned XML content length:', cleanXml.length);
  
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(cleanXml, 'text/xml');
  
  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    console.error('XML parsing error:', parserError.textContent);
    throw new Error('קובץ ה-XML אינו תקין. שגיאת פרסור: ' + parserError.textContent);
  }

  // Try different possible item tag names
  const possibleItemTags = ['Item', 'Items/Item', 'PriceFull/Items/Item', 'Product', 'Products/Product'];
  let items: Element[] = [];
  
  for (const tag of possibleItemTags) {
    const foundItems = xmlDoc.getElementsByTagName(tag);
    if (foundItems.length > 0) {
      console.log(`Found ${foundItems.length} items using tag: ${tag}`);
      items = Array.from(foundItems);
      break;
    }
  }

  if (items.length === 0) {
    console.error('No items found in XML. Document structure:', xmlDoc.documentElement.outerHTML);
    throw new Error('לא נמצאו פריטים בקובץ ה-XML. נסה להשתמש בתבנית תקנית');
  }

  console.log(`Successfully found ${items.length} items in XML`);
  return items;
};

export const parseXmlItems = (items: Element[]) => {
  console.log('Starting to parse XML items...');
  
  return items.map((item, index) => {
    try {
      // Log the current item's XML structure
      console.log(`Parsing item ${index + 1}:`, item.outerHTML);

      // Helper function to safely get text content
      const getElementText = (parent: Element, tags: string[]): string => {
        for (const tag of tags) {
          const element = parent.getElementsByTagName(tag)[0];
          if (element?.textContent) {
            return element.textContent.trim();
          }
        }
        return '';
      };

      // Try multiple possible tag names for each field
      const product = {
        store_chain: 'שופרסל', // Default value
        store_id: '001',
        product_code: getElementText(item, ['ItemCode', 'PriceCode', 'Code', 'id', 'ProductCode']),
        product_name: getElementText(item, ['ItemName', 'PriceName', 'Name', 'ProductName', 'description']),
        manufacturer: getElementText(item, ['ManufacturerName', 'Manufacturer', 'manufacturer', 'Producer']),
        price: parseFloat(getElementText(item, ['ItemPrice', 'Price', 'price', 'UnitPrice'])) || 0,
        unit_quantity: getElementText(item, ['Quantity', 'UnitQty', 'quantity', 'Amount']),
        unit_of_measure: getElementText(item, ['UnitOfMeasure', 'Unit', 'unit', 'MeasureUnit']),
        category: getElementText(item, ['ItemSection', 'Category', 'category', 'Department']) || 'אחר',
        price_update_date: new Date().toISOString()
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

      console.log(`Successfully parsed product ${index + 1}:`, product);
      return product;
    } catch (error) {
      console.error(`Error parsing item ${index + 1}:`, error);
      throw new Error(`שגיאה בפרסור פריט ${index + 1}: ${error.message}`);
    }
  });
};