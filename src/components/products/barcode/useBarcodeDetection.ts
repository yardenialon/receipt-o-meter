import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface UseBarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export const useBarcodeDetection = ({ onScan }: UseBarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showGoogleLens, setShowGoogleLens] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const findProductByBarcode = async (barcode: string) => {
    console.log('Searching for product with barcode:', barcode);
    
    try {
      const { data, error } = await supabase
        .from('store_products_import')
        .select('*')
        .eq('ItemCode', barcode)
        .limit(1);

      if (error) {
        console.error('Error searching for product:', error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log('Product found:', data[0]);
        return data[0];
      }
      
      console.log('No product found with barcode:', barcode);
      return null;
    } catch (error) {
      console.error('Error in findProductByBarcode:', error);
      toast.error('שגיאה בחיפוש המוצר');
      return null;
    }
  };

  const detectBarcodeWithNative = async (video: HTMLVideoElement): Promise<string | null> => {
    try {
      // Check if BarcodeDetector is supported
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector();
        const barcodes = await barcodeDetector.detect(video);
        
        if (barcodes.length > 0) {
          return barcodes[0].rawValue;
        }
      }
      return null;
    } catch (error) {
      console.error('Error using native BarcodeDetector:', error);
      return null;
    }
  };

  const detectBarcodeWithVision = async (imageBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('image', imageBlob);
      
      const response = await fetch('https://kthqkydgegsoheymesgc.supabase.co/functions/v1/detect-barcode', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to detect barcode');
      }

      const result = await response.json();
      if (result.barcode) {
        const product = await findProductByBarcode(result.barcode);
        if (product) {
          onScan(result.barcode);
          toast.success('מוצר נמצא!');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error detecting barcode:', error);
      return false;
    }
  };

  const captureAndAnalyzeFrame = async () => {
    if (!videoRef.current) return false;
    
    // First try native BarcodeDetector
    const nativeBarcode = await detectBarcodeWithNative(videoRef.current);
    if (nativeBarcode) {
      const product = await findProductByBarcode(nativeBarcode);
      if (product) {
        onScan(nativeBarcode);
        toast.success('מוצר נמצא!');
        return true;
      }
    }
    
    // If native detection fails, try Vision API
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    ctx.drawImage(videoRef.current, 0, 0);
    
    return new Promise<boolean>((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        const success = await detectBarcodeWithVision(blob);
        resolve(success);
      }, 'image/jpeg', 0.8);
    });
  };

  const stopScanning = useCallback(() => {
    console.log('Stopping scanner...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setIsInitializing(false);
    setShowGoogleLens(false);
  }, []);

  const startScanning = async () => {
    try {
      setIsInitializing(true);
      console.log('Starting camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          console.log('Video stream ready');
          videoRef.current?.play();
          setIsInitializing(false);
          setIsScanning(true);
          
          // Start periodic frame capture and analysis
          const analyzeInterval = setInterval(async () => {
            if (!isScanning) {
              clearInterval(analyzeInterval);
              return;
            }
            
            const success = await captureAndAnalyzeFrame();
            if (success) {
              clearInterval(analyzeInterval);
              stopScanning();
            }
          }, 1000); // Check every second
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
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