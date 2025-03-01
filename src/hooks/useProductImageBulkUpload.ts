
import { useState } from 'react';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { BulkUploadProgress, BulkUploadOptions } from '@/types/product-images';

// Helper function to check if table exists
async function checkIfTableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(tableName as any)
      .select('id')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

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
      const csvData = await new Promise<any[]>((resolve, reject) => {
        Papa.parse(csvFile, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data);
          },
          error: (error) => {
            reject(error);
          }
        });
      });

      // Create a batch record
      const batchId = uuidv4();
      const batchName = csvFile.name.split('.')[0];
      
      // Create batch record
      const { error: batchError } = await supabase
        .from('image_batch_uploads' as any)
        .insert({
          id: batchId,
          name: batchName,
          total_images: csvData.length,
          status: 'processing'
        });
      
      if (batchError) {
        console.error('Error creating batch record:', batchError);
      }

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
        setProgress(prev => ({
          ...prev,
          processed: i + 1
        }));

        // Skip if no product code or image file
        if (!productCode || !imageFileName) {
          setProgress(prev => ({
            ...prev,
            failed: prev.failed + 1,
            errors: [...prev.errors, {
              productCode: productCode || 'unknown',
              fileName: imageFileName || 'unknown',
              error: 'Missing product code or image file name'
            }]
          }));
          continue;
        }

        // Find the image file
        const imageFile = imageFilesMap.get(imageFileName);
        if (!imageFile) {
          setProgress(prev => ({
            ...prev,
            failed: prev.failed + 1,
            errors: [...prev.errors, {
              productCode,
              fileName: imageFileName,
              error: 'Image file not found in uploaded files'
            }]
          }));
          continue;
        }

        try {
          // Upload image
          const fileName = `${uuidv4()}-${imageFile.name}`;
          const filePath = `${productCode}/${fileName}`;

          // If primary, update other images
          if (isPrimary) {
            await supabase
              .from('product_images' as any)
              .update({ is_primary: false })
              .eq('product_code', productCode);
          }

          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, imageFile);

          if (uploadError) {
            throw new Error(`Storage upload error: ${uploadError.message}`);
          }

          // Add to database
          const { error: dbError } = await supabase
            .from('product_images' as any)
            .insert({
              product_code: productCode,
              image_path: filePath,
              is_primary: isPrimary,
              status: 'active',
              batch_id: batchId
            });

          if (dbError) {
            throw new Error(`Database insert error: ${dbError.message}`);
          }

          // Update progress for success
          setProgress(prev => ({
            ...prev,
            success: prev.success + 1
          }));
        } catch (error) {
          // Handle error
          setProgress(prev => ({
            ...prev,
            failed: prev.failed + 1,
            errors: [...prev.errors, {
              productCode,
              fileName: imageFileName,
              error: error instanceof Error ? error.message : 'Unknown error'
            }]
          }));
        }
      }

      // Update batch record
      await supabase
        .from('image_batch_uploads' as any)
        .update({
          processed_images: progress.processed,
          successful_images: progress.success,
          failed_images: progress.failed,
          completed_at: new Date().toISOString(),
          status: progress.failed === 0 ? 'completed' : 'failed'
        })
        .eq('id', batchId);

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
