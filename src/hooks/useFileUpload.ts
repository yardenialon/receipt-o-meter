import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks
const MAX_PARALLEL_UPLOADS = 3; // Maximum number of concurrent chunk uploads

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const processFile = async (file: File, networkName: string, branchName: string) => {
    if (!networkName || !branchName) {
      throw new Error('חסרים פרטי רשת וסניף');
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('User not authenticated');

      // Read file content
      const fileContent = await file.arrayBuffer();
      
      console.log('Sending file to Edge Function...');
      const { data, error } = await supabase.functions.invoke('fetch-xml-prices', {
        body: fileContent,
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        body: {
          networkName,
          branchName,
        }
      });

      if (error) throw error;
      
      console.log('Edge Function response:', data);
      
      if (data?.success) {
        toast.success(`הקובץ התקבל בהצלחה. גודל: ${Math.round(data.fileSize / 1024)}KB`);
      } else {
        throw new Error('שגיאה בעיבוד הקובץ');
      }

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