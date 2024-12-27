import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { uploadProductsToSupabase } from '@/utils/xml/supabaseUtils';
import { XmlDropZone } from './XmlDropZone';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XmlUploadDialog } from './XmlUploadDialog';
import { XmlContentInput } from './XmlContentInput';

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
    if (file.size > 50 * 1024 * 1024) {
      toast.error('הקובץ גדול מדי. הגודל המקסימלי הוא 50MB');
      return;
    }

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

      <XmlContentInput
        xmlContent={xmlContent}
        setXmlContent={setXmlContent}
        isUploading={isUploading}
        onUpload={handleXmlContentUpload}
      />

      <XmlUploadDialog
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        networkName={networkName}
        setNetworkName={setNetworkName}
        branchName={branchName}
        setBranchName={setBranchName}
        pendingFile={pendingFile}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default XmlUpload;