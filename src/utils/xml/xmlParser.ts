export const parseXmlContent = async (xmlText: string) => {
  console.log('Starting XML parsing...');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    console.error('XML parsing error:', parserError.textContent);
    throw new Error('קובץ ה-XML אינו תקין. אנא ודא שהקובץ תקין ונסה שוב');
  }

  // Log the XML structure for debugging
  console.log('XML Structure:', xmlDoc.documentElement.outerHTML);

  const items = xmlDoc.getElementsByTagName('Item');
  console.log(`Found ${items.length} items in XML`);
  
  if (items.length === 0) {
    throw new Error('לא נמצאו פריטים בקובץ ה-XML. אנא ודא שהקובץ מכיל תגיות <Item>');
  }

  return Array.from(items);
};

export const parseXmlItems = (items: Element[]) => {
  return items.map((item, index) => {
    try {
      const product = {
        store_chain: 'שופרסל',
        store_id: '001',
        product_code: item.getElementsByTagName('ItemCode')[0]?.textContent || '',
        product_name: item.getElementsByTagName('ItemName')[0]?.textContent || '',
        manufacturer: item.getElementsByTagName('ManufacturerName')[0]?.textContent || '',
        price: parseFloat(item.getElementsByTagName('ItemPrice')[0]?.textContent || '0'),
        unit_quantity: item.getElementsByTagName('UnitQty')[0]?.textContent || '',
        unit_of_measure: item.getElementsByTagName('UnitMeasure')[0]?.textContent || '',
        category: item.getElementsByTagName('ItemSection')[0]?.textContent || 'אחר',
        price_update_date: new Date().toISOString()
      };

      // Log each product for debugging
      console.log(`Parsing product ${index + 1}:`, product);

      // Validate required fields
      if (!product.product_code || !product.product_name) {
        throw new Error(`מוצר ${index + 1} חסר קוד מוצר או שם מוצר`);
      }

      if (isNaN(product.price) || product.price < 0) {
        throw new Error(`מוצר ${index + 1} מחיר לא תקין: ${product.price}`);
      }

      return product;
    } catch (error) {
      console.error(`Error parsing product ${index + 1}:`, error);
      throw new Error(`שגיאה בפרסור מוצר ${index + 1}: ${error.message}`);
    }
  });
};