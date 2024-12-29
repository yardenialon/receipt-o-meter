import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks
const MAX_PARALLEL_UPLOADS = 3; // Maximum number of concurrent chunk uploads

export const PriceFileUpload = () => {
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
          // Update chunk status to processing
          await supabase
            .from('price_upload_chunks')
            .update({ status: 'processing', started_at: new Date().toISOString() })
            .eq('upload_id', uploadId)
            .eq('chunk_index', chunk.index);

          // Process the chunk (you can add more processing logic here)
          const reader = new FileReader();
          await new Promise((resolve, reject) => {
            reader.onload = resolve;
            reader.onerror = reject;
            reader.readAsText(chunk.data);
          });

          // Update chunk status to completed
          await supabase
            .from('price_upload_chunks')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('upload_id', uploadId)
            .eq('chunk_index', chunk.index);

          processedChunks.add(chunk.index);
          updateProgress();
        } catch (error) {
          console.error(`Error processing chunk ${chunk.index}:`, error);
          
          // Update chunk status to error
          await supabase
            .from('price_upload_chunks')
            .update({
              status: 'error',
              error_message: error instanceof Error ? error.message : 'Unknown error',
              completed_at: new Date().toISOString()
            })
            .eq('upload_id', uploadId)
            .eq('chunk_index', chunk.index);

          throw error;
        }
      });

      // Wait for all chunks in the current batch to complete
      await Promise.all(promises);
    }

    // Update upload record status
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create upload record
      const { data: uploadRecord, error: uploadError } = await supabase
        .from('price_file_uploads')
        .insert({
          filename: file.name,
          store_chain: 'unknown', // TODO: Add store chain selection
          total_chunks: Math.ceil(file.size / CHUNK_SIZE),
          status: 'pending',
          created_by: user.id
        })
        .select()
        .single();

      if (uploadError) throw uploadError;

      // Split file into chunks
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

      // Create chunk records
      const chunkInserts = chunks.map((chunk) => ({
        upload_id: uploadRecord.id,
        chunk_index: chunk.index,
        status: 'pending'
      }));

      const { error: chunksError } = await supabase
        .from('price_upload_chunks')
        .insert(chunkInserts);

      if (chunksError) throw chunksError;

      // Process chunks in parallel
      await processChunksInParallel(chunks, uploadRecord.id);

      toast.success('הקובץ הועלה ועובד בהצלחה');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאת הקובץ');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > 3 * 1024 * 1024 * 1024) { // 3GB limit
        toast.error('הקובץ גדול מדי. הגודל המקסימלי הוא 3GB');
        return;
      }

      await processFile(file);
    },
    maxFiles: 1,
    disabled: isUploading,
    accept: {
      'text/xml': ['.xml'],
      'application/xml': ['.xml']
    }
  });

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          ניתן להעלות קובץ XML בגודל של עד 3GB. המערכת תחלק את הקובץ לחלקים קטנים ותעבד אותם במקביל.
        </AlertDescription>
      </Alert>

      <div
        {...getRootProps()}
        className={`
          w-full p-8 border-2 border-dashed rounded-xl
          transition-colors duration-200 ease-in-out cursor-pointer
          ${isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-300'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          {isUploading ? (
            <div className="animate-pulse">
              <File className="w-12 h-12 text-primary-500" />
            </div>
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">
              {isDragActive
                ? "שחרר את הקובץ כאן"
                : "גרור וזרוק את קובץ ה-XML כאן"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              או לחץ לבחירת קובץ
            </p>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-gray-500 text-center">
            מעלה... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}
    </div>
  );
};