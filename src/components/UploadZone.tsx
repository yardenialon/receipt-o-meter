import { useState } from 'react';
import { uploadReceiptToSupabase } from '@/lib/supabase-upload';
import CameraCapture from './upload/CameraCapture';
import DropZone from './upload/DropZone';
import PaymentButtons from './upload/PaymentButtons';

const UploadZone = () => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: Blob) => {
    setIsUploading(true);
    try {
      await uploadReceiptToSupabase(file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <DropZone onFileDrop={handleFile} isUploading={isUploading} />
      
      <div className="flex flex-col items-center gap-4">
        <CameraCapture onPhotoCapture={handleFile} />
        <PaymentButtons />
      </div>
    </div>
  );
};

export default UploadZone;