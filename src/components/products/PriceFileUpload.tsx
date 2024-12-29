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

export const PriceFileUpload = () => {
  const { isUploading, uploadProgress, processFile } = useFileUpload();
  const [showDialog, setShowDialog] = useState(false);
  const [networkName, setNetworkName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      toast.error('לא נבחר קובץ');
      return;
    }

    try {
      // Validate file before processing
      await validateXMLFile(file);
      setPendingFile(file);
      setShowDialog(true);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'שגיאה בהעלאת הקובץ');
    }
  };

  const handleConfirm = async () => {
    if (!networkName || !branchName) {
      toast.error('אנא הזן שם רשת ושם סניף');
      return;
    }

    if (pendingFile) {
      try {
        await processFile(pendingFile, networkName, branchName);
        setShowDialog(false);
        setPendingFile(null);
        setNetworkName('');
        setBranchName('');
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>פרטי הרשת והסניף</DialogTitle>
            <DialogDescription>
              אנא הזן את שם הרשת ושם הסניף עבור הקובץ
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
                placeholder="לדוגמה: שופרסל"
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
          </div>
          <DialogFooter>
            <Button
              onClick={handleConfirm}
              disabled={!networkName || !branchName || isUploading}
            >
              {isUploading ? 'מעלה...' : 'אישור'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};