import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';

interface DropZoneProps {
  onFileDrop: (file: Blob) => Promise<void>;
  isUploading: boolean;
}

const DropZone = ({ onFileDrop, isUploading }: DropZoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      onFileDrop(acceptedFiles[0]);
    }
  }, [onFileDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      className={`
        w-full max-w-xl mx-auto mt-8 p-8 border-2 border-dashed rounded-xl
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
              ? "שחרר את הקבלה כאן"
              : "גרור וזרוק את הקבלה כאן"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            או לחץ לבחירת קובץ
          </p>
        </div>
      </div>
    </div>
  );
};

export default DropZone;