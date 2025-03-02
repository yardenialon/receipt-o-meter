
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface DropZoneProps {
  onFileDrop: (file: Blob) => void;
  isUploading?: boolean;
  maxFiles?: number;
  accept?: Record<string, string[]>;
  className?: string;
}

const DropZone: React.FC<DropZoneProps> = ({
  onFileDrop,
  isUploading = false,
  maxFiles = 1,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif']
  },
  className
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileDrop(acceptedFiles[0]);
      }
    },
    [onFileDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
    maxFiles,
    accept
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
      } ${className}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm font-medium">
        {isDragActive ? 'שחרר כדי להעלות' : 'גרור קובץ לכאן או לחץ לבחירה'}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        {isUploading ? 'מעלה...' : 'גודל מקסימלי: 5MB'}
      </p>
    </div>
  );
};

export default DropZone;
