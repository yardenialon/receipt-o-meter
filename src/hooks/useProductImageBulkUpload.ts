
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BulkUploadProgress, BulkUploadOptions, BulkUploadError } from '@/types/bulk-upload';
import { checkIfTableExists } from '@/utils/product-images/tableUtils';
import { parseCSVFile } from '@/utils/product-images/csvParsingUtils';
import { createBatchUploadRecord, updateBatchUploadRecord } from '@/utils/product-images/batchUploadUtils';
import { uploadImageFile } from '@/utils/product-images/imageUploadUtils';

export function useProductImageBulkUpload() {
  const [progress, setProgress] = useState<BulkUploadProgress>({
    status: 'idle',
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    errors: []
  });

  const resetProgress = () => {
    setProgress({
      status: 'idle',
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      errors: []
    });
  };

  const addError = (error: BulkUploadError) => {
    setProgress(prev => ({
      ...prev,
      failed: prev.failed + 1,
      errors: [...prev.errors, error]
    }));
  };

  const updateProgress = (processed: number, success?: number) => {
    setProgress(prev => ({
      ...prev,
      processed,
      success: success !== undefined ? success : prev.success
    }));
  };

  const processBulkUpload = async (
    csvFile: File,
    imageFiles: File[],
    options: BulkUploadOptions = {}
  ) => {
    try {
      // Start processing
      setProgress({
        status: 'processing',
        total: 0,
        processed: 0,
        success: 0,
        failed: 0,
        errors: []
      });

      // Check if tables exist
      const productImagesTableExists = await checkIfTableExists('product_images');
      const batchUploadsTableExists = await checkIfTableExists('image_batch_uploads');
      
      if (!productImagesTableExists || !batchUploadsTableExists) {
        throw new Error('Required tables do not exist. Please ensure they are created first.');
      }

      // Parse CSV file
      const csvData = await parseCSVFile(csvFile);

      // Create a batch record
      const batchId = uuidv4();
      const batchName = csvFile.name.split('.')[0];
      
      // Create batch record
      await createBatchUploadRecord(batchId, batchName, csvData.length);

      // Create image file map for quick lookup
      const imageFilesMap = new Map<string, File>();
      imageFiles.forEach(file => {
        imageFilesMap.set(file.name, file);
      });

      // Prepare for processing
      setProgress(prev => ({
        ...prev,
        total: csvData.length,
      }));

      // Process each row
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        const productCode = row.product_code;
        const imageFileName = row.image_file;
        const isPrimary = options.primaryColumn && row[options.primaryColumn] === 'true';

        // Update progress
        updateProgress(i + 1);

        // Skip if no product code or image file
        if (!productCode || !imageFileName) {
          addError({
            productCode: productCode || 'unknown',
            fileName: imageFileName || 'unknown',
            error: 'Missing product code or image file name'
          });
          continue;
        }

        // Find the image file
        const imageFile = imageFilesMap.get(imageFileName);
        if (!imageFile) {
          addError({
            productCode,
            fileName: imageFileName,
            error: 'Image file not found in uploaded files'
          });
          continue;
        }

        try {
          // Upload image
          const result = await uploadImageFile(imageFile, productCode, isPrimary, batchId);
          
          if (result.success) {
            // Update progress for success
            setProgress(prev => ({
              ...prev,
              success: prev.success + 1
            }));
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          // Handle error
          addError({
            productCode,
            fileName: imageFileName,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Update batch record with final stats
      const finalStatus = progress.failed === 0 ? 'completed' : 'failed';
      await updateBatchUploadRecord(
        batchId, 
        progress.processed, 
        progress.success, 
        progress.failed, 
        finalStatus as 'completed' | 'failed'
      );

      // Mark as completed
      setProgress(prev => ({
        ...prev,
        status: prev.failed === 0 ? 'completed' : 'failed'
      }));

      return true;
    } catch (error) {
      console.error('Error in bulk upload:', error);
      
      setProgress(prev => ({
        ...prev,
        status: 'failed',
        errors: [...prev.errors, {
          productCode: 'batch',
          fileName: 'batch',
          error: error instanceof Error ? error.message : 'Unknown error during batch processing'
        }]
      }));
      
      return false;
    }
  };

  return {
    progress,
    processBulkUpload,
    resetProgress
  };
}
