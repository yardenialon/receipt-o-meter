import { useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export const ChainMappingUpload = () => {
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

      console.log('Sending file to process-chain-mapping function:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const { data, error } = await supabase.functions.invoke('process-chain-mapping', {
        body: formData
      });

      if (error) throw error;

      console.log('Processing response:', data);
      toast.success('קובץ המיפוי עובד בהצלחה');

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('שגיאה בהעלאת הקובץ: ' + (error instanceof Error ? error.message : 'אנא נסה שוב'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold">העלאת מיפוי רשתות</h3>
      
      <Alert>
        <AlertDescription>
          העלה קובץ CSV המכיל את מיפוי הרשתות. הקובץ צריך להכיל את העמודות: source_chain_id, source_chain_name, our_chain_id, mapping_status
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