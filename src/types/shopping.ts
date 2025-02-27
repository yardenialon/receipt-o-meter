
export interface ShoppingListItem {
  id: string;
  name: string;
  is_completed?: boolean;
  quantity?: number;
  product_code?: string | null;
  list_id?: string;
}

export interface Product {
  product_code: string;
  product_name: string;
  price: number;
  store_chain?: string;
  store_id?: string;
  branch_mapping_id?: string;
  branch_mappings?: {
    source_chain: string;
    source_branch_id: string;
    source_branch_name: string | null;
  };
}

export interface StoreComparison {
  storeName: string;
  storeId: string | null;
  branchName?: string | null;
  branchAddress?: string | null;
  items: Array<{
    name: string;
    price: number | null;
    matchedProduct: string;
    quantity: number;
    isAvailable: boolean;
    product_code?: string | null;
  }>;
  total: number;
  availableItemsCount: number;
  products?: Product[];
}
