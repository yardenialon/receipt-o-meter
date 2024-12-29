import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { uploadProductsToSupabase } from '@/utils/xml/supabaseUtils';

const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks
const MAX_PARALLEL_UPLOADS = 3; // Maximum number of concurrent chunk uploads

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const processChunksInParallel = async (chunks: { index: number; data: Blob }[], uploadId: string) => {
    const processedChunks = new Set<number>();
    let completedChunks = 0;
    
    const updateProgress = () => {
      completedChunks++;
      setUploadProgress((completedChunks / chunks.length) * 100);
    };

    // Process chunks in batches
    for (let i = 0; i < chunks.length; i += MAX_PARALLEL_UPLOADS) {
      const batch = chunks.slice(i, i + MAX_PARALLEL_UPLOADS);
      const promises = batch.map(async (chunk) => {
        if (processedChunks.has(chunk.index)) return;

        try {
          const reader = new FileReader();
          const text = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(chunk.data);
          });

          // For now, we'll use hardcoded values for testing
          await uploadProductsToSupabase(text, 'test-network', 'test-branch');

          processedChunks.add(chunk.index);
          updateProgress();
        } catch (error) {
          console.error(`Error processing chunk ${chunk.index}:`, error);
          throw error;
        }
      });

      await Promise.all(promises);
    }

    await supabase
      .from('price_file_uploads')
      .update({
        status: 'completed',
        processed_chunks: chunks.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', uploadId);
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('User not authenticated');

      const { data: uploadRecord, error: uploadError } = await supabase
        .from('price_file_uploads')
        .insert({
          filename: file.name,
          store_chain: 'unknown',
          total_chunks: Math.ceil(file.size / CHUNK_SIZE),
          status: 'pending',
          created_by: session.user.id
        })
        .select()
        .single();

      if (uploadError) throw uploadError;

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const chunks: { index: number; data: Blob }[] = [];

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        chunks.push({
          index: i,
          data: file.slice(start, end)
        });
      }

      const chunkInserts = chunks.map((chunk) => ({
        upload_id: uploadRecord.id,
        chunk_index: chunk.index,
        status: 'pending'
      }));

      const { error: chunksError } = await supabase
        .from('price_upload_chunks')
        .insert(chunkInserts);

      if (chunksError) throw chunksError;

      await processChunksInParallel(chunks, uploadRecord.id);

      toast.success('הקובץ הועלה ועובד בהצלחה');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאת הקובץ: ' + (error instanceof Error ? error.message : 'אנא נסה שוב'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    isUploading,
    uploadProgress,
    processFile
  };
};