export interface DocumentAIResult {
  items: Array<{
    name: string;
    price: number;
    quantity?: number;
  }>;
  total: number;
  storeName: string;
}