import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';
import { toast } from 'sonner';

const UploadZone = () => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      toast.success('Receipt uploaded successfully!');
    }, 2000);
  }, []);

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
              ? "Drop your receipt here"
              : "Drag & drop your receipt here"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            or click to select a file
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadZone;