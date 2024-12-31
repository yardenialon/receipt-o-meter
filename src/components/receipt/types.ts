export interface ReceiptItem {
  id: string;
  receipt_id: string;
  name: string;
  price: number;
  quantity: number;
  refundable_amount: number;
  created_at: string;
}

export interface ReceiptData {
  id: string;
  store_name: string;
  total: number;
  total_refundable: number;
  image_url: string | null;
  created_at: string;
  user_id: string;
  receipt_items: ReceiptItem[];
}

export interface ProcessingProgress {
  [key: string]: number;
}