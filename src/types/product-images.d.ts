
// Type definitions for product images and related functionality

export interface ProductImage {
  id: string;
  product_code: string;
  image_path: string;
  created_at: string;
  is_primary: boolean;
  status: string;
  batch_id?: string;
}

export interface ImageBatchUpload {
  id: string;
  name: string;
  total_images: number;
  processed_images: number;
  successful_images: number;
  failed_images: number;
  status: string;
  created_at: string;
  completed_at?: string;
}

export interface BulkUploadProgress {
  status: 'idle' | 'processing' | 'completed' | 'failed';
  total: number;
  processed: number;
  success: number;
  failed: number;
  errors: Array<{
    productCode: string;
    fileName: string;
    error: string;
  }>;
}

export interface BulkUploadOptions {
  primaryColumn?: string;
}
