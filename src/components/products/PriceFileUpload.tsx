import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFileUpload } from '@/hooks/useFileUpload';
import { UploadProgress } from './upload/UploadProgress';
import { UploadZone } from './upload/UploadZone';

export const PriceFileUpload = () => {
  const { isUploading, uploadProgress, processFile } = useFileUpload();

  const handleDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      toast.error('לא נבחר קובץ');
      return;
    }

    if (file.size > 3 * 1024 * 1024 * 1024) { // 3GB limit
      toast.error('הקובץ גדול מדי. הגודל המקסימלי הוא 3GB');
      return;
    }

    await processFile(file, 'unknown', 'unknown');
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          ניתן להעלות קובץ XML בגודל של עד 3GB. המערכת תחלק את הקובץ לחלקים קטנים ותעבד אותם במקביל.
        </AlertDescription>
      </Alert>

      <UploadZone 
        isUploading={isUploading}
        onDrop={handleDrop}
      />

      <UploadProgress 
        isUploading={isUploading}
        progress={uploadProgress}
      />
    </div>
  );
};