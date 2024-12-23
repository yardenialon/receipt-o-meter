import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';

const UploadZone = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      toast.error('Unable to access camera');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          handleFile(blob);
        }
      }, 'image/jpeg');

      // Stop camera stream
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setShowCamera(false);
    }
  };

  const handleFile = async (file: Blob) => {
    setIsUploading(true);
    // Simulate upload delay - in a real app, you'd send to your backend
    setTimeout(() => {
      setIsUploading(false);
      toast.success('Receipt uploaded successfully!');
    }, 2000);
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
          <Button onClick={() => {
            const stream = videoRef.current?.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
            setShowCamera(false);
          }}>
            Cancel
          </Button>
          <Button onClick={capturePhoto} variant="default">
            Take Photo
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
                ? "Drop your receipt here"
                : "Drag & drop your receipt here"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to select a file
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button
          onClick={startCamera}
          variant="outline"
          className="flex items-center gap-2"
          disabled={isUploading}
        >
          <Camera className="w-4 h-4" />
          Take Photo
        </Button>
      </div>
    </div>
  );
};

export default UploadZone;