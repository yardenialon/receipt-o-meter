export interface DocumentAIResult {
  items: Array<{
    name: string;
    price: number;
    quantity?: number;
    product_code?: string;
  }>;
  total: number;
  storeName: string;
}