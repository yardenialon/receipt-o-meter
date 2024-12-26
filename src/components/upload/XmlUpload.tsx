import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { uploadProductsToSupabase } from '@/utils/xml/supabaseUtils';
import { XmlDropZone } from './XmlDropZone';

const XmlUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [driveUrl, setDriveUrl] = useState('');

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
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאת הקובץ: ' + (error instanceof Error ? error.message : 'אנא נסה שוב'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDriveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrl) {
      toast.error('אנא הזן כתובת URL');
      return;
    }

    setIsUploading(true);
    toast.loading('מוריד את הקובץ מ-Google Drive...');

    try {
      console.log('Starting upload from Drive URL:', driveUrl);
      const count = await uploadProductsToSupabase(driveUrl);
      toast.success(`הועלו ${count} מוצרים בהצלחה`);
    } catch (error) {
      console.error('Drive upload error:', error);
      toast.error('שגיאה בהורדת הקובץ: ' + (error instanceof Error ? error.message : 'אנא נסה שוב'));
    } finally {
      setIsUploading(false);
      setDriveUrl('');
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

      <form onSubmit={handleDriveUpload} className="w-full max-w-xl mx-auto space-y-4">
        <div className="flex gap-2">
          <div className="flex-grow">
            <Input
              type="url"
              placeholder="הדבק כתובת URL של קובץ XML מ-Google Drive"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              className="w-full"
              dir="ltr"
              disabled={isUploading}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isUploading || !driveUrl}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <div className="animate-spin">
                <File className="w-4 h-4" />
              </div>
            ) : (
              <LinkIcon className="w-4 h-4" />
            )}
            העלה מ-Drive
          </Button>
        </div>
      </form>
    </div>
  );
};

export default XmlUpload;