export interface XmlProduct {
  store_chain: string;
  store_id: string;
  product_code: string;
  product_name: string;
  manufacturer: string | null;
  price: number;
  unit_quantity: string | null;
  unit_of_measure: string | null;
  category: string | null;
  price_update_date: string;
}

export interface XmlParseResult {
  items: XmlProduct[];
  count: number;
}