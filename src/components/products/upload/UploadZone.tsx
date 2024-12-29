import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';

interface UploadZoneProps {
  isUploading: boolean;
  onDrop: (files: File[]) => void;
}

export const UploadZone = ({ isUploading, onDrop }: UploadZoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    disabled: isUploading,
    accept: {
      'text/xml': ['.xml'],
      'application/xml': ['.xml']
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
              : "גרור וזרוק את קובץ ה-XML כאן"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            או לחץ לבחירת קובץ
          </p>
        </div>
      </div>
    </div>
  );
};