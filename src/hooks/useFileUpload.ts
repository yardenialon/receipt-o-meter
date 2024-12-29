import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
      console.log('Starting file upload:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Read file content as text
      const xmlContent = await file.text();
      console.log('File content read:', {
        length: xmlContent.length,
        preview: xmlContent.substring(0, 100)
      });
      
      if (!xmlContent) {
        throw new Error('Could not read file content');
      }

      console.log('Sending file to Edge Function...', {
        networkName,
        branchName,
        contentLength: xmlContent.length
      });

      const { data, error } = await supabase.functions.invoke('fetch-xml-prices', {
        body: xmlContent,
        headers: {
          'Content-Type': 'text/xml',
          'x-network-name': networkName,
          'x-branch-name': branchName,
          'x-file-name': file.name
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      console.log('Edge Function response:', data);
      
      if (data?.success) {
        toast.success('הקובץ התקבל בהצלחה');
        setUploadProgress(100);
      } else {
        throw new Error(data?.error || 'שגיאה בעיבוד הקובץ');
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאת הקובץ: ' + (error instanceof Error ? error.message : 'אנא נסה שוב'));
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadProgress,
    processFile
  };
};