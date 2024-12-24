import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface CameraCaptureProps {
  onPhotoCapture: (blob: Blob) => Promise<void>;
}

const CameraCapture = ({ onPhotoCapture }: CameraCaptureProps) => {
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const startCamera = async () => {
    if (isMobile) {
      // On mobile, trigger the file input which includes camera option
      fileInputRef.current?.click();
      return;
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('מצלמה לא נתמכת במכשיר זה');
      }

      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
        setShowCamera(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (err instanceof Error) {
        toast.error(`לא ניתן לגשת למצלמה: ${err.message}`);
      } else {
        toast.error('לא ניתן לגשת למצלמה. אנא בדקו את ההרשאות.');
      }
    }
  };

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await onPhotoCapture(file);
      } catch (err) {
        console.error('Error handling file:', err);
        toast.error('שגיאה בטעינת הקובץ');
      }
    }
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob(
        async (blob) => {
          if (blob) {
            try {
              await onPhotoCapture(blob);
              stopCamera();
            } catch (err) {
              console.error('Error saving photo:', err);
              toast.error('שגיאה בשמירת התמונה');
            }
          }
        },
        'image/jpeg',
        0.95
      );
    }
  };

  if (showCamera) {
    return (
      <div className="w-full max-w-xl mx-auto mt-8 space-y-4">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full rounded-xl border border-gray-200"
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex justify-center gap-4">
          <Button onClick={stopCamera} variant="outline">
            ביטול
          </Button>
          <Button onClick={capturePhoto} variant="default">
            צלם תמונה
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileInput}
      />
      <Button
        onClick={startCamera}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Camera className="w-4 h-4" />
        צלם קבלה
      </Button>
    </>
  );
};

export default CameraCapture;