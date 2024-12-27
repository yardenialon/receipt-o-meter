import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { uploadProductsToSupabase } from '@/utils/xml/supabaseUtils';
import { XmlDropZone } from './XmlDropZone';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

const XmlUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [xmlContent, setXmlContent] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [networkName, setNetworkName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [pendingXmlContent, setPendingXmlContent] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async (content: string) => {
    if (!networkName || !branchName) {
      toast.error('אנא הזן שם רשת ושם סניף');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const result = await uploadProductsToSupabase(content, networkName, branchName);
      if (result.count > 0) {
        toast.success(`הועלו ${result.count} מוצרים בהצלחה`);
        setXmlContent('');
        setShowDialog(false);
        setPendingXmlContent(null);
        setPendingFile(null);
      } else {
        toast.error('לא הועלו מוצרים. אנא בדוק את תוכן ה-XML');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאת הקובץ: ' + (error instanceof Error ? error.message : 'אנא נסה שוב'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast.error('לא נבחר קובץ');
      return;
    }

    const file = acceptedFiles[0];
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error('הקובץ גדול מדי. הגודל המקסימלי הוא 50MB');
      return;
    }

    console.log('Reading file:', file.name);
    const text = await file.text();
    setPendingFile(file);
    setPendingXmlContent(text);
    setShowDialog(true);
  };

  const handleXmlContentUpload = () => {
    if (!xmlContent.trim()) {
      toast.error('אנא הכנס תוכן XML');
      return;
    }
    setPendingXmlContent(xmlContent);
    setShowDialog(true);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/xml': ['.xml'],
      'application/xml': ['.xml']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  const handleConfirm = () => {
    if (pendingXmlContent) {
      handleUpload(pendingXmlContent);
    }
  };

  return (
    <div className="space-y-8">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          ניתן להעלות קובץ XML או להדביק את תוכן ה-XML ישירות בתיבת הטקסט למטה.
          גודל מקסימלי לקובץ הוא 50MB.
        </AlertDescription>
      </Alert>

      <XmlDropZone
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        isDragActive={isDragActive}
        isUploading={isUploading}
      />

      <div className="flex items-center gap-4">
        <div className="flex-grow border-t border-gray-200" />
        <span className="text-sm text-gray-500">או</span>
        <div className="flex-grow border-t border-gray-200" />
      </div>

      <div className="w-full max-w-xl mx-auto space-y-4">
        <Textarea
          placeholder="הדבק כאן את תוכן ה-XML"
          value={xmlContent}
          onChange={(e) => setXmlContent(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
          dir="ltr"
          disabled={isUploading}
        />
        <Button 
          onClick={handleXmlContentUpload}
          disabled={isUploading || !xmlContent.trim()}
          className="w-full flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <div className="animate-spin">
              <File className="w-4 h-4" />
            </div>
          ) : (
            <Upload className="w-4 h-4" />
          )}
          העלה תוכן XML
        </Button>
      </div>

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
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-500 text-center">
                  מעלה מוצרים... {uploadProgress}%
                </p>
              </div>
            )}
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

export default XmlUpload;