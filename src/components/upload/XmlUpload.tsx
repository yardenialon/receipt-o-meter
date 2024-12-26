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

const XmlUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [xmlContent, setXmlContent] = useState('');

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast.error('לא נבחר קובץ');
      return;
    }

    setIsUploading(true);
    try {
      const file = acceptedFiles[0];
      console.log('Reading file:', file.name);
      const text = await file.text();
      const count = await uploadProductsToSupabase(text);
      toast.success(`הועלו ${count} מוצרים בהצלחה`);
      setXmlContent(''); // Clear the textarea after successful upload
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאת הקובץ: ' + (error instanceof Error ? error.message : 'אנא נסה שוב'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleXmlContentUpload = async () => {
    if (!xmlContent.trim()) {
      toast.error('אנא הכנס תוכן XML');
      return;
    }

    setIsUploading(true);
    try {
      const count = await uploadProductsToSupabase(xmlContent);
      toast.success(`הועלו ${count} מוצרים בהצלחה`);
      setXmlContent(''); // Clear the textarea after successful upload
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאת התוכן: ' + (error instanceof Error ? error.message : 'אנא נסה שוב'));
    } finally {
      setIsUploading(false);
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

  return (
    <div className="space-y-8">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          ניתן להעלות קובץ XML או להדביק את תוכן ה-XML ישירות בתיבת הטקסט למטה
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
    </div>
  );
};

export default XmlUpload;