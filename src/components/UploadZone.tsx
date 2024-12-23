import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Camera, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/lib/supabase';

const UploadZone = () => {
  const [isUploading, setIsUploading] = useState(false);
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
          await handleFile(blob);
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  const handleFile = async (file: Blob) => {
    setIsUploading(true);
    try {
      const fileName = `receipt-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('receipts')
        .insert([
          {
            file_name: fileName,
            url: publicUrl,
            status: 'pending',
            created_at: new Date().toISOString(),
          }
        ]);

      if (dbError) throw dbError;

      toast.success('הקבלה הועלתה בהצלחה!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאת הקבלה. אנא נסו שוב.');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      handleFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

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
    <div className="space-y-4">
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
      
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={startCamera}
          variant="outline"
          className="flex items-center gap-2"
          disabled={isUploading}
        >
          <Camera className="w-4 h-4" />
          צלם קבלה
        </Button>

        <div className="mt-8 text-center">
          <Button
            variant="default"
            className="mb-4 w-full max-w-xs"
            onClick={() => toast.info('בקרוב - קבלת החזר כספי')}
          >
            לחץ כאן לקבלת החזר כספי
          </Button>
          
          <div className="flex justify-center gap-6">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => toast.info('בקרוב - תשלום דרך Bit')}
            >
              <Smartphone className="w-5 h-5" />
              Bit
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => toast.info('בקרוב - תשלום דרך Paybox')}
            >
              <Smartphone className="w-5 h-5" />
              Paybox
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadZone;