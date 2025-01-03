import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';
import { toast } from 'sonner';

interface UploadZoneProps {
  isUploading: boolean;
  onDrop: (files: File[]) => void;
}

export const UploadZone = ({ isUploading, onDrop }: UploadZoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file && file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error('הקובץ גדול מדי. הגודל המקסימלי הוא 100MB');
        return;
      }
      onDrop(acceptedFiles);
    },
    maxFiles: 1,
    disabled: isUploading,
    accept: {
      'text/xml': ['.xml'],
      'application/xml': ['.xml'],
      'application/gzip': ['.gz'],
      'application/x-gzip': ['.gz']
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`
        w-full p-8 border-2 border-dashed rounded-xl
        transition-colors duration-200 ease-in-out cursor-pointer
        ${isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-300'}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        {isUploading ? (
          <div className="animate-pulse">
            <File className="w-12 h-12 text-primary-500" />
          </div>
        ) : (
          <Upload className="w-12 h-12 text-gray-400" />
        )}
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700">
            {isDragActive
              ? "שחרר את הקובץ כאן"
              : "גרור וזרוק את קובץ ה-XML או GZ כאן"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            או לחץ לבחירת קובץ
          </p>
          <p className="text-xs text-gray-400 mt-2">
            קבצי XML או GZ עד 100MB
          </p>
        </div>
      </div>
    </div>
  );
};