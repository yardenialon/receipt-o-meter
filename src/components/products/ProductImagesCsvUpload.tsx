import { useState } from 'react';
import { toast } from 'sonner';
import { FileSpreadsheet, Upload, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/lib/supabase';
import { useDropzone } from 'react-dropzone';

interface ProductImagesCsvUploadProps {
  onSuccess?: () => void;
}

export const ProductImagesCsvUpload = ({ onSuccess }: ProductImagesCsvUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleCsvUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('אנא העלה קובץ CSV בלבד');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('process-product-images-csv', {
        body: formData
      });

      if (error) {
        console.error('Error processing CSV:', error);
        throw error;
      }

      if (data?.success) {
        toast.success(`הועלו ${data.processedCount} תמונות בהצלחה`);
        if (onSuccess) {
          onSuccess();
        }
        setIsOpen(false);
      } else {
        throw new Error(data?.error || 'שגיאה בעיבוד הקובץ');
      }

    } catch (error) {
      console.error('CSV upload error:', error);
      toast.error('שגיאה בהעלאת קובץ ה-CSV: ' + (error instanceof Error ? error.message : 'אנא נסה שוב'));
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleCsvUpload(acceptedFiles[0]);
      }
    },
    maxFiles: 1,
    disabled: isUploading,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    }
  });

  const downloadTemplate = () => {
    const csvContent = `SKU,Product Name,Image URL
7290000123456,שמפו ראש וכתפיים,https://example.com/image1.jpg
7290000654321,משחת שיניים קולגייט,https://example.com/image2.jpg`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'product_images_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          העלאת CSV תמונות
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>העלאת תמונות מוצרים מ-CSV</SheetTitle>
          <SheetDescription>
            העלה קובץ CSV עם קישורים לתמונות מוצרים
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              הורד תבנית CSV
            </Button>
          </div>

          {isUploading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">מעבד קובץ CSV...</p>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`
                w-full p-8 border-2 border-dashed rounded-xl
                transition-colors duration-200 ease-in-out cursor-pointer
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-4">
                <Upload className="w-12 h-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">
                    {isDragActive
                      ? "שחרר את קובץ ה-CSV כאן"
                      : "גרור וזרוק קובץ CSV כאן"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    או לחץ לבחירת קובץ
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-xs text-muted-foreground space-y-2">
            <p><strong>פורמט הקובץ:</strong></p>
            <p>• SKU - קוד המוצר (חובה)</p>
            <p>• Product Name - שם המוצר</p>
            <p>• Image URL - קישור לתמונה (חובה)</p>
            <p className="text-amber-600 mt-2">
              <strong>שים לב:</strong> התמונות צריכות להיות זמינות באינטרנט
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};