export interface ShoppingListItem {
  name: string;
  is_completed?: boolean;
  quantity?: number;
}

export interface StoreBranch {
  name: string | null;
  address: string | null;
}

export interface BranchMapping {
  source_chain: string;
  source_branch_id: string;
  source_branch_name: string | null;
  store_branches?: StoreBranch | null;
}

export interface Product {
  branch_mappings: BranchMapping;
  product_code: string;
  product_name: string;
  price: number;
}

export interface StoreComparison {
  storeName: string;
  storeId: string;
  branchName: string | null;
  branchAddress: string | null;
  items: Array<{
    name: string;
    price: number | null;
    matchedProduct: string;
    quantity: number;
    isAvailable: boolean;
  }>;
  total: number;
  availableItemsCount: number;
}