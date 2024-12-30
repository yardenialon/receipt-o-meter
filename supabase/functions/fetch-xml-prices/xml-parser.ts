import { parse } from 'https://deno.land/x/xml@2.1.1/mod.ts';

export async function parseXMLContent(xmlContent: string) {
  if (!xmlContent) {
    throw new Error('XML content is empty');
  }

  try {
    console.log('Starting XML parsing...');
    const xmlData = parse(xmlContent);
    
    if (!xmlData) {
      throw new Error('Failed to parse XML data');
    }

    // Handle XML structure with null checks
    let items;
    if (xmlData?.root?.Items?.Item) {
      items = xmlData.root.Items.Item;
    } else if (xmlData?.Items?.Item) {
      items = xmlData.Items.Item;
    } else {
      console.error('XML Structure:', JSON.stringify(xmlData, null, 2));
      throw new Error('Could not find Item elements in expected locations');
    }

    // Convert to array if single item
    const itemsArray = Array.isArray(items) ? items : [items].filter(Boolean);
    console.log(`Found ${itemsArray.length} items in XML`);
    
    if (itemsArray.length === 0) {
      throw new Error('No items found in XML');
    }
    
    return itemsArray;
  } catch (error) {
    console.error('XML Parsing Error:', error);
    throw error;
  }
}