import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFileUpload } from '@/hooks/useFileUpload';
import { UploadProgress } from './upload/UploadProgress';
import { UploadZone } from './upload/UploadZone';
import { validateXMLFile } from '@/utils/xml/xmlValidation';

export const PriceFileUpload = () => {
  const { isUploading, uploadProgress, processFile } = useFileUpload();

  const handleDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      toast.error('לא נבחר קובץ');
      return;
    }

    try {
      // Validate file before processing
      await validateXMLFile(file);
      await processFile(file, 'unknown', 'unknown');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'שגיאה בהעלאת הקובץ');
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          ניתן להעלות קובץ XML בגודל של עד 100MB. המערכת תעבד את הקובץ ותשמור את המוצרים במסד הנתונים.
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