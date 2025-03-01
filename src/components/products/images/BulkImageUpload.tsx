import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDropzone } from 'react-dropzone';
import { useProductImageBulkUpload } from '@/hooks/useProductImageBulkUpload';
import { UploadCloud, AlertCircle, CheckCircle, FileText, ImageIcon, FileQuestion } from 'lucide-react';

export function BulkImageUpload({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const { progress, processBulkUpload, resetProgress } = useProductImageBulkUpload();

  const {
    getRootProps: getCsvRootProps,
    getInputProps: getCsvInputProps
  } = useDropzone({
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setCsvFile(acceptedFiles[0]);
      }
    }
  });

  const {
    getRootProps: getImagesRootProps,
    getInputProps: getImagesInputProps
  } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    onDrop: acceptedFiles => {
      setImageFiles(prev => [...prev, ...acceptedFiles]);
    }
  });

  const resetState = () => {
    setCsvFile(null);
    setImageFiles([]);
    resetProgress();
    setActiveTab('upload');
  };

  const handleClose = () => {
    if (progress.status !== 'processing') {
      resetState();
      setOpen(false);
    }
  };

  const removeImageFile = (fileName: string) => {
    setImageFiles(prev => prev.filter(file => file.name !== fileName));
  };

  const handleUpload = async () => {
    if (!csvFile || imageFiles.length === 0) return;
    
    setActiveTab('progress');
    await processBulkUpload(csvFile, imageFiles, { primaryColumn: 'is_primary' });
    
    if (onSuccess) {
      onSuccess();
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
        return <ImageIcon className="h-4 w-4 text-blue-500" />;
      case 'csv':
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <FileQuestion className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusInfo = () => {
    switch (progress.status) {
      case 'processing':
        return {
          icon: <UploadCloud className="h-5 w-5 text-blue-500 animate-pulse" />,
          message: 'מעלה תמונות...'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          message: 'ההעלאה הושלמה בהצלחה'
        };
      case 'failed':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          message: 'ההעלאה נכשלה'
        };
      default:
        return {
          icon: null,
          message: ''
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Dialog open={open} onOpenChange={(val) => progress.status !== 'processing' && setOpen(val)}>
      <DialogTrigger asChild>
        <Button>
          <UploadCloud className="mr-2 h-4 w-4" />
          העלאה המונית של תמונות
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>העלאה המונית של תמונות מוצר</DialogTitle>
          <DialogDescription>
            העלה קובץ CSV המכיל מיפוי בין קודי מוצרים לקבצי תמונה, ואת קבצי התמונות עצמם.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" disabled={progress.status === 'processing'}>
              העלאת קבצים
            </TabsTrigger>
            <TabsTrigger value="progress">
              התקדמות
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">1. קובץ CSV עם מיפוי</h3>
                {!csvFile ? (
                  <div 
                    {...getCsvRootProps()} 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input {...getCsvInputProps()} />
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      גרור ושחרר קובץ CSV כאן, או לחץ לבחירת קובץ
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      נדרשות עמודות: product_code, image_file
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm">{csvFile.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCsvFile(null)}
                    >
                      הסר
                    </Button>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">
                  2. קבצי התמונות ({imageFiles.length} קבצים)
                </h3>
                <div 
                  {...getImagesRootProps()} 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input {...getImagesInputProps()} />
                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    גרור ושחרר קבצי תמונה כאן, או לחץ לבחירת קבצים
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG או WEBP עד 5MB לקובץ
                  </p>
                </div>
                
                {imageFiles.length > 0 && (
                  <div className="mt-3 border rounded-lg max-h-32 overflow-y-auto">
                    <ul className="divide-y">
                      {imageFiles.map((file, index) => (
                        <li 
                          key={`${file.name}-${index}`}
                          className="p-2 flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center">
                            {getFileIcon(file.name)}
                            <span className="mr-2 truncate max-w-[150px]">{file.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImageFile(file.name)}
                          >
                            הסר
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <Alert className="bg-blue-50 border-blue-200">
                <AlertTitle className="text-blue-800 text-sm">טיפ: מבנה קובץ CSV</AlertTitle>
                <AlertDescription className="text-blue-700 text-xs">
                  קובץ ה-CSV צריך להכיל לפחות שתי עמודות: 'product_code' (קוד המוצר) ו-'image_file' (שם קובץ התמונה). ניתן גם להוסיף עמודה 'is_primary' עם הערכים 'true' או 'false' כדי לציין תמונות ראשיות.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          <TabsContent value="progress" className="py-4">
            <div className="space-y-4">
              {progress.status !== 'idle' && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      {statusInfo.icon}
                      <span className="mr-2 text-sm font-medium">{statusInfo.message}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {progress.processed}/{progress.total}
                    </span>
                  </div>
                  
                  <Progress value={(progress.processed / Math.max(progress.total, 1)) * 100} />
                  
                  <div className="grid grid-cols-2 gap-4 text-center text-sm">
                    <div className="border rounded-lg p-2 bg-green-50">
                      <p className="text-green-700 font-semibold text-lg">{progress.success}</p>
                      <p className="text-green-600">הצלחות</p>
                    </div>
                    <div className="border rounded-lg p-2 bg-red-50">
                      <p className="text-red-700 font-semibold text-lg">{progress.failed}</p>
                      <p className="text-red-600">שגיאות</p>
                    </div>
                  </div>
                  
                  {progress.errors.length > 0 && (
                    <div className="border rounded-lg max-h-40 overflow-y-auto">
                      <div className="p-2 bg-gray-50 border-b text-sm font-medium">שגיאות</div>
                      <ul className="divide-y">
                        {progress.errors.map((error, index) => (
                          <li key={index} className="p-2 text-xs">
                            <p className="font-semibold">
                              מוצר: {error.productCode}, קובץ: {error.fileName}
                            </p>
                            <p className="text-red-500 mt-1">{error.error}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={progress.status === 'processing'}
          >
            {progress.status === 'completed' || progress.status === 'failed' ? 'סגור' : 'ביטול'}
          </Button>
          
          {activeTab === 'upload' && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!csvFile || imageFiles.length === 0}
            >
              התחל העלאה
            </Button>
          )}
          
          {activeTab === 'progress' && progress.status !== 'processing' && (
            <Button
              type="button"
              onClick={resetState}
            >
              העלאה חדשה
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
