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
  const isMobile = useIsMobile();

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: isMobile ? 'environment' : 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setShowCamera(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      toast.error('לא ניתן לגשת למצלמה. אנא בדקו את ההרשאות.');
    }
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
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          await onPhotoCapture(blob);
          stopCamera();
        }
      }, 'image/jpeg');
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
          <Button onClick={stopCamera}>
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
    <Button
      onClick={startCamera}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Camera className="w-4 h-4" />
      צלם קבלה
    </Button>
  );
};

export default CameraCapture;