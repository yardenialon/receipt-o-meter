import { Progress } from '@/components/ui/progress';

interface UploadProgressProps {
  isUploading: boolean;
  progress: number;
}

export const UploadProgress = ({ isUploading, progress }: UploadProgressProps) => {
  if (!isUploading) return null;

  return (
    <div className="space-y-2">
      <Progress value={progress} className="w-full" />
      <p className="text-sm text-gray-500 text-center">
        מעלה... {Math.round(progress)}%
      </p>
    </div>
  );
};