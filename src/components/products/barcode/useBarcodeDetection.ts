
import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  findProductByBarcode,
  detectBarcodeWithNative,
  detectBarcodeWithVision
} from './barcodeDetectors';
import { initializeCamera, captureFrame } from './cameraManager';

interface UseBarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export const useBarcodeDetection = ({ onScan }: UseBarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showGoogleLens, setShowGoogleLens] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const stopScanning = useCallback(() => {
    console.log('Stopping scanner...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
    setIsInitializing(false);
    setShowGoogleLens(false);
  }, []);

  const processBarcode = async (barcode: string): Promise<boolean> => {
    const product = await findProductByBarcode(barcode);
    if (product) {
      onScan(barcode);
      toast.success('מוצר נמצא!');
      return true;
    }
    return false;
  };

  const scanFrame = async (): Promise<boolean> => {
    if (!videoRef.current || !videoRef.current.videoWidth) return false;

    // Try native detection first
    const nativeBarcode = await detectBarcodeWithNative(videoRef.current);
    if (nativeBarcode && await processBarcode(nativeBarcode)) {
      return true;
    }

    // Fallback to Vision API
    try {
      const frameBlob = await captureFrame(videoRef.current);
      const visionBarcode = await detectBarcodeWithVision(frameBlob);
      if (visionBarcode && await processBarcode(visionBarcode)) {
        return true;
      }
    } catch (error) {
      console.error('Error in frame analysis:', error);
    }

    return false;
  };

  const startScanning = async () => {
    try {
      setIsInitializing(true);
      console.log('Starting scanner...');
      
      const stream = await initializeCamera(videoRef);
      if (!stream) {
        throw new Error('Failed to initialize camera');
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = () => {
          console.log('Video stream ready');
          videoRef.current?.play();
          setIsInitializing(false);
          setIsScanning(true);
          
          // Start periodic scanning
          scanIntervalRef.current = window.setInterval(async () => {
            if (!isScanning) {
              if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
              }
              return;
            }
            
            const success = await scanFrame();
            if (success) {
              stopScanning();
            }
          }, 1000);
        };
      }
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast.error('לא ניתן לגשת למצלמה');
      setShowGoogleLens(true);
      setIsScanning(false);
      setIsInitializing(false);
    }
  };

  const openGoogleLens = () => {
    window.open('https://lens.google.com', '_blank');
    toast.info('נפתח סורק Google Lens בחלון חדש');
    setShowGoogleLens(false);
  };

  return {
    isScanning,
    isInitializing,
    showGoogleLens,
    videoRef,
    startScanning,
    stopScanning,
    openGoogleLens,
    setShowGoogleLens
  };
};
