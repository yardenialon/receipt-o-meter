import { useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export const KeshetFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's a CSV file
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('יש להעלות קובץ CSV בלבד');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Sending file to process-keshet-csv function:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const { data, error } = await supabase.functions.invoke('process-keshet-csv', {
        body: formData
      });

      if (error) throw error;

      console.log('Processing response:', data);
      toast.success('הקובץ עובד בהצלחה');

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('שגיאה בהעלאת הקובץ: ' + (error instanceof Error ? error.message : 'אנא נסה שוב'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold">העלאת מוצרי רשת קשת</h3>
      
      <Alert>
        <AlertDescription>
          העלה קובץ CSV המכיל את מוצרי רשת קשת. המערכת תעבד את הקובץ ותעדכן את מחירי המוצרים באופן אוטומטי.
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          className="relative w-full"
          disabled={isUploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'מעלה...' : 'העלה קובץ CSV'}
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
        </Button>
      </div>
    </div>
  );
};