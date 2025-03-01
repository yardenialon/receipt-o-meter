
export interface BulkUploadError {
  productCode: string;
  fileName: string;
  error: string;
}

export interface BulkUploadProgress {
  status: 'idle' | 'processing' | 'completed' | 'failed';
  total: number;
  processed: number;
  success: number;
  failed: number;
  errors: BulkUploadError[];
}

export interface BulkUploadOptions {
  primaryColumn?: string;
}
