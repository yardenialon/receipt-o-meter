
import { useState } from 'react';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

interface BulkUploadProgress {
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

interface BulkUploadOptions {
  primaryColumn?: string;
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

      // Check if product_images and image_batch_uploads tables exist
      await ensureTablesExist();

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
              .from('product_images')
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
            .from('product_images')
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

  // Helper function to ensure required tables exist
  async function ensureTablesExist() {
    try {
      // Check if product_images table exists, create it if not
      const { error: checkError } = await supabase
        .from('product_images')
        .select('id')
        .limit(1);
      
      if (checkError && checkError.message.includes('does not exist')) {
        // Create the product_images table
        await supabase.rpc('create_product_images_table');
      }
      
      // Check if image_batch_uploads table exists, create it if not
      const { error: batchCheckError } = await supabase
        .from('image_batch_uploads')
        .select('id')
        .limit(1);
      
      if (batchCheckError && batchCheckError.message.includes('does not exist')) {
        // Create the image_batch_uploads table
        await supabase.rpc('create_image_batch_uploads_table');
      }
    } catch (error) {
      console.error('Error ensuring tables exist:', error);
    }
  }

  return {
    progress,
    processBulkUpload,
    resetProgress
  };
}
