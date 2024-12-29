import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { XmlDropZone } from './XmlDropZone';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XmlUploadDialog } from './XmlUploadDialog';
import { XmlContentInput } from './XmlContentInput';
import { useFileUpload } from '@/hooks/useFileUpload';

const XmlUpload = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [networkName, setNetworkName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [xmlContent, setXmlContent] = useState('');

  const { isUploading, uploadProgress, processFile } = useFileUpload();

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast.error('לא נבחר קובץ');
      return;
    }

    const file = acceptedFiles[0];
    if (file.size > 3 * 1024 * 1024 * 1024) { // 3GB limit
      toast.error('הקובץ גדול מדי. הגודל המקסימלי הוא 3GB');
      return;
    }

    setPendingFile(file);
    setShowDialog(true);
  };

  const handleConfirm = async () => {
    if (!networkName || !branchName) {
      toast.error('אנא הזן שם רשת ושם סניף');
      return;
    }

    if (pendingFile) {
      await processFile(pendingFile, networkName, branchName);
      setShowDialog(false);
      setPendingFile(null);
    }
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

  const handleXmlContentUpload = () => {
    if (!xmlContent.trim()) {
      toast.error('אנא הכנס תוכן XML');
      return;
    }
    setShowDialog(true);
  };

  return (
    <div className="space-y-8">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          ניתן להעלות קובץ XML או להדביק את תוכן ה-XML ישירות בתיבת הטקסט למטה.
          המערכת תחלק את הקובץ לחלקים קטנים ותעבד אותם במקביל.
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