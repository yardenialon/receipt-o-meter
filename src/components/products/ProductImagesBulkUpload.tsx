import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UploadProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
}

export const ProductImagesBulkUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error('אנא בחר קובץ CSV תקין');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('אנא בחר קובץ CSV');
      return;
    }

    setUploading(true);
    setProgress({ total: 0, processed: 0, succeeded: 0, failed: 0 });

    try {
      const csvText = await file.text();
      
      console.log('שולח קובץ CSV לעיבוד...');
      const { data, error } = await supabase.functions.invoke('process-product-images-csv', {
        body: { csvContent: csvText }
      });

      if (error) {
        console.error('שגיאה ב-Edge Function:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'שגיאה בעיבוד הקובץ');
      }

      setProgress(data.progress);
      toast.success(`הועלו ${data.progress.succeeded} תמונות בהצלחה`);
    } catch (error) {
      console.error('שגיאה בהעלאת תמונות:', error);
      toast.error('שגיאה בהעלאת התמונות: ' + (error instanceof Error ? error.message : 'שגיאה לא ידועה'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          העלאת תמונות מוצרים בכמויות גדולות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-600 mb-4">
            העלה קובץ CSV עם העמודות: מק"ט, שם מוצר, URL תמונה
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="mb-4"
          />
          {file && (
            <p className="text-sm text-green-600">
              נבחר קובץ: {file.name}
            </p>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">פורמט הקובץ הנדרש:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>קובץ CSV עם כותרות בשורה הראשונה</li>
                <li>עמודה ראשונה: מק"ט המוצר</li>
                <li>עמודה שנייה: שם המוצר</li>
                <li>עמודה שלישית: URL של התמונה</li>
              </ul>
            </div>
          </div>
        </div>

        {progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>התקדמות: {progress.processed}/{progress.total}</span>
              <span className="text-green-600">הצליחו: {progress.succeeded}</span>
              <span className="text-red-600">נכשלו: {progress.failed}</span>
            </div>
            <Progress value={(progress.processed / progress.total) * 100} />
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? 'מעבד...' : 'העלה תמונות'}
        </Button>
      </CardContent>
    </Card>
  );
};