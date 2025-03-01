
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Papa from 'papaparse';

interface UploadProgress {
  total: number;
  processed: number;
  success: number;
  failed: number;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  errors: Array<{
    productCode: string;
    fileName: string;
    error: string;
  }>;
}

export function useProductImageBulkUpload() {
  const [progress, setProgress] = useState<UploadProgress>({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    status: 'idle',
    errors: []
  });

  /**
   * Reset the progress state
   */
  const resetProgress = () => {
    setProgress({
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      status: 'idle',
      errors: []
    });
  };

  /**
   * Process a CSV mapping file and image files
   * The CSV should have at least two columns: 'product_code' and 'image_file'
   */
  const processBulkUpload = async (
    csvFile: File,
    imageFiles: File[],
    options = { primaryColumn: '' }
  ) => {
    setProgress({
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      status: 'processing',
      errors: []
    });

    try {
      // Create file map for quick lookup
      const fileMap = new Map<string, File>();
      imageFiles.forEach(file => {
        fileMap.set(file.name, file);
      });

      // Parse CSV file
      const parseResult = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
        Papa.parse(csvFile, {
          header: true,
          complete: resolve,
          error: reject,
          skipEmptyLines: true,
        });
      });

      if (!parseResult.data || parseResult.data.length === 0) {
        throw new Error('הקובץ CSV ריק או לא בפורמט תקין');
      }

      const { data } = parseResult;
      setProgress(prev => ({ ...prev, total: data.length }));

      // Create batch upload record
      const { data: batchRecord, error: batchError } = await supabase
        .from('image_batch_uploads')
        .insert({
          file_name: csvFile.name,
          total_images: data.length,
          status: 'processing'
        })
        .select()
        .single();

      if (batchError) {
        throw batchError;
      }

      // Process each mapping row
      let successCount = 0;
      let failedCount = 0;
      const errors: any[] = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        try {
          // Validate required fields
          if (!row.product_code || !row.image_file) {
            throw new Error('חסרים שדות חובה: product_code או image_file');
          }

          // Find the image file
          const imageFile = fileMap.get(row.image_file);
          if (!imageFile) {
            throw new Error(`קובץ התמונה "${row.image_file}" לא נמצא בקבצים שהועלו`);
          }

          // Check if this should be a primary image
          const isPrimary = options.primaryColumn && row[options.primaryColumn] === 'true';

          // Upload the image
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${row.product_code}_${Date.now()}.${fileExt}`;
          const filePath = `${row.product_code}/${fileName}`;

          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('product_images')
            .upload(filePath, imageFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            throw uploadError;
          }

          // If this is primary, reset any existing primary images
          if (isPrimary) {
            await supabase
              .from('product_images')
              .update({ is_primary: false })
              .eq('product_code', row.product_code)
              .eq('is_primary', true);
          }

          // Save to database
          const { error: dbError } = await supabase
            .from('product_images')
            .insert({
              product_code: row.product_code,
              image_path: filePath,
              is_primary: isPrimary,
              source: 'bulk_upload'
            });

          if (dbError) {
            throw dbError;
          }

          successCount++;
        } catch (error) {
          failedCount++;
          errors.push({
            productCode: row.product_code,
            fileName: row.image_file,
            error: error instanceof Error ? error.message : 'שגיאה לא ידועה'
          });
        }

        // Update progress
        setProgress(prev => ({
          ...prev,
          processed: i + 1,
          success: successCount,
          failed: failedCount,
          errors
        }));

        // Update batch record
        await supabase
          .from('image_batch_uploads')
          .update({
            processed_images: i + 1,
            success_count: successCount,
            failed_count: failedCount,
            error_log: errors.length ? errors : null
          })
          .eq('id', batchRecord.id);
      }

      // Mark batch as completed
      await supabase
        .from('image_batch_uploads')
        .update({
          status: failedCount === 0 ? 'completed' : (successCount > 0 ? 'completed' : 'failed'),
          completed_at: new Date().toISOString()
        })
        .eq('id', batchRecord.id);

      // Set final status
      setProgress(prev => ({
        ...prev,
        status: failedCount === 0 ? 'completed' : (successCount > 0 ? 'completed' : 'failed')
      }));

      if (failedCount === 0) {
        toast.success(`כל ${successCount} התמונות הועלו בהצלחה`);
      } else if (successCount > 0) {
        toast.success(`הועלו ${successCount} תמונות, ${failedCount} נכשלו`);
      } else {
        toast.error('כל התמונות נכשלו בהעלאה');
      }

      return {
        batchId: batchRecord.id,
        success: successCount,
        failed: failedCount,
        errors
      };
    } catch (error) {
      console.error('Error in bulk upload:', error);
      setProgress(prev => ({
        ...prev,
        status: 'failed',
        errors: [...prev.errors, {
          productCode: 'general',
          fileName: 'general',
          error: error instanceof Error ? error.message : 'שגיאה לא ידועה'
        }]
      }));
      toast.error('שגיאה בהעלאה המונית: ' + (error instanceof Error ? error.message : 'שגיאה לא ידועה'));
      return null;
    }
  };

  return {
    progress,
    processBulkUpload,
    resetProgress
  };
}
