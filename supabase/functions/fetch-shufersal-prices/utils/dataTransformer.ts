import { parse } from "https://deno.land/x/xml@2.1.1/mod.ts";

export interface ShufersalProduct {
  StoreId?: string[];
  ItemCode?: string[];
  ItemName?: string[];
  ManufacturerName?: string[];
  UnitQty?: string[];
  UnitMeasure?: string[];
  ItemPrice?: string[];
}

export const parseXmlContent = (xmlText: string) => {
  console.log('Parsing XML content...');
  const data = parse(xmlText);
  const items = data.Items?.Item || [];
  
  if (!items.length) {
    throw new Error('No items found in the XML file');
  }
  
  console.log(`Found ${items.length} items in the XML file`);
  return items;
};

export const transformProducts = (items: ShufersalProduct[]) => {
  return items.map(item => ({
    store_chain: 'שופרסל',
    store_id: item.StoreId?.[0] || null,
    product_code: item.ItemCode?.[0] || '',
    product_name: item.ItemName?.[0] || '',
    manufacturer: item.ManufacturerName?.[0] || null,
    price: parseFloat(item.ItemPrice?.[0] || '0'),
    unit_quantity: item.UnitQty?.[0] || null,
    unit_of_measure: item.UnitMeasure?.[0] || null,
    price_update_date: new Date().toISOString(),
  }));
};