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
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      className={`
        w-full max-w-md mx-auto p-6 border-2 border-dashed rounded-xl
        transition-all duration-200 ease-in-out cursor-pointer backdrop-blur-sm
        ${isDragActive ? 'border-primary-400 bg-primary-50/50' : 'border-gray-200 hover:border-primary-200'}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-2">
        {isUploading ? (
          <div className="animate-pulse">
            <File className="w-8 h-8 text-primary-500" />
          </div>
        ) : (
          <Upload className="w-8 h-8 text-gray-400" />
        )}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">
            {isDragActive
              ? "שחרר את הקבלה כאן"
              : "או גרור קבלה לכאן"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            קבצים נתמכים: JPG, PNG, PDF
          </p>
        </div>
      </div>
    </div>
  );
};

export default DropZone;