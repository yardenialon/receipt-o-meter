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
      <div className="w-full max-w-xl mx-auto space-y-4">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full rounded-2xl border border-primary-100 shadow-lg"
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex justify-center gap-4">
          <Button 
            onClick={stopCamera} 
            variant="outline"
            className="px-8 py-6 text-lg"
          >
            ביטול
          </Button>
          <Button 
            onClick={capturePhoto} 
            variant="default"
            className="px-8 py-6 text-lg bg-primary hover:bg-primary-600"
          >
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
      <div className="mt-[50px]">
        <Button
          onClick={startCamera}
          size="lg"
          className="relative overflow-hidden group bg-gradient-to-r from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-8 py-6 w-full md:w-auto"
        >
          <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300" />
          <div className="relative flex items-center justify-center gap-4">
            <Camera className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
            <span className="text-lg md:text-xl font-medium">צלם קבלה</span>
          </div>
          <div className="absolute inset-0 border border-white/20 rounded-2xl" />
        </Button>
      </div>
    </>
  );
};

export default CameraCapture;