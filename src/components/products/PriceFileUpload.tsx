import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFileUpload } from '@/hooks/useFileUpload';
import { UploadProgress } from './upload/UploadProgress';
import { UploadZone } from './upload/UploadZone';
import { validateXMLFile } from '@/utils/xml/xmlValidation';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export const PriceFileUpload = () => {
  const { isUploading, uploadProgress, processFile } = useFileUpload();
  const [showDialog, setShowDialog] = useState(false);
  const [networkName, setNetworkName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [branchId, setBranchId] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      toast.error('לא נבחר קובץ');
      return;
    }

    try {
      // Check if it's a dumps directory file
      const isDumpsFile = file.name.toLowerCase().includes('bareket') || 
                         file.name.toLowerCase().includes('shufersal') ||
                         file.name.toLowerCase().includes('rami');

      if (file.name.endsWith('.gz')) {
        // For .gz files, we'll process them directly
        setPendingFile(file);
        setShowDialog(true);
      } else {
        // For XML files, validate before processing
        await validateXMLFile(file);
        setPendingFile(file);
        setShowDialog(true);

        // If it's from dumps directory, try to extract store info from filename
        if (isDumpsFile) {
          const storeName = file.name.split('_')[0];
          setNetworkName(storeName.charAt(0).toUpperCase() + storeName.slice(1));
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'שגיאה בהעלאת הקובץ');
    }
  };

  const handleConfirm = async () => {
    if (!networkName || !branchName || !storeAddress || !branchId) {
      toast.error('אנא הזן את כל פרטי החנות');
      return;
    }

    if (pendingFile) {
      try {
        console.log('Processing file:', {
          name: pendingFile.name,
          type: pendingFile.type,
          size: pendingFile.size,
          networkName,
          branchName,
          branchId,
          storeAddress
        });

        const formData = new FormData();
        formData.append('file', pendingFile);
        formData.append('networkName', networkName);
        formData.append('branchName', branchName);
        formData.append('branchId', branchId);
        formData.append('storeAddress', storeAddress);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No session found');
        }

        const { data, error } = await supabase.functions.invoke(
          pendingFile.name.endsWith('.gz') ? 'process-gz-prices' : 'fetch-xml-prices',
          {
            body: formData
          }
        );

        if (error) {
          throw error;
        }

        console.log('Processing result:', data);
        toast.success('הקובץ עובד בהצלחה');
        
        setShowDialog(false);
        setPendingFile(null);
        setNetworkName('');
        setBranchName('');
        setBranchId('');
        setStoreAddress('');
      } catch (error) {
        console.error('Processing error:', error);
        toast.error(error instanceof Error ? error.message : 'שגיאה בעיבוד הקובץ');
      }
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          ניתן להעלות קובץ XML או GZ מתיקיית ה-dumps המקומית. המערכת תעבד את הקובץ ותשמור את המוצרים במסד הנתונים.
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>פרטי החנות</DialogTitle>
            <DialogDescription>
              אנא הזן את פרטי החנות עבור הקובץ
              {pendingFile && (
                <div className="mt-2 text-sm text-gray-500">
                  שם הקובץ: {pendingFile.name}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="networkName">שם הרשת</Label>
              <Input
                id="networkName"
                value={networkName}
                onChange={(e) => setNetworkName(e.target.value)}
                placeholder="לדוגמה: רמי לוי"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchId">מספר סניף</Label>
              <Input
                id="branchId"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                placeholder="לדוגמה: 001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchName">שם הסניף</Label>
              <Input
                id="branchName"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="לדוגמה: סניף רמת אביב"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeAddress">כתובת הסניף</Label>
              <Input
                id="storeAddress"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                placeholder="לדוגמה: אבן גבירול 20, תל אביב"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleConfirm}
              disabled={!networkName || !branchName || !storeAddress || !branchId || isUploading}
            >
              {isUploading ? 'מעלה...' : 'אישור'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};