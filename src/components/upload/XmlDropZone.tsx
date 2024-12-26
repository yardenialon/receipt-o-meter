import { Upload, File } from 'lucide-react';

interface XmlDropZoneProps {
  getRootProps: any;
  getInputProps: any;
  isDragActive: boolean;
  isUploading: boolean;
}

export const XmlDropZone = ({ getRootProps, getInputProps, isDragActive, isUploading }: XmlDropZoneProps) => {
  return (
    <div
      {...getRootProps()}
      className={`
        w-full max-w-xl mx-auto p-8 border-2 border-dashed rounded-xl
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
              ? "שחרר את קובץ ה-XML כאן"
              : "גרור וזרוק את קובץ ה-XML כאן"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            או לחץ לבחירת קובץ
          </p>
          <p className="text-xs text-gray-400 mt-2">
            קבצי XML בלבד
          </p>
        </div>
      </div>
    </div>
  );
};