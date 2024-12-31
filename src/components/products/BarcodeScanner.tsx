import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export const BarcodeScanner = ({ onScan }: BarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const isMobile = useIsMobile();

  const startScanning = async () => {
    try {
      setIsInitializing(true);
      console.log('Starting barcode scanner...');
      
      // Check if BarcodeDetector is supported
      if ('BarcodeDetector' in window) {
        setIsScanning(true);
        
        // Initialize BarcodeDetector with supported formats
        console.log('Initializing BarcodeDetector...');
        detectorRef.current = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e']
        });
        
        // Get camera stream with optimal settings
        console.log('Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: isMobile ? 'environment' : 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          } 
        });
        
        if (videoRef.current) {
          console.log('Setting up video stream...');
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          
          // Start detection loop when video is ready
          videoRef.current.onloadedmetadata = () => {
            console.log('Video stream ready, starting detection...');
            videoRef.current?.play();
            detectBarcode();
            setIsInitializing(false);
            toast.success('מצלמה מוכנה לסריקה');
          };
        }
      } else {
        console.log('BarcodeDetector not supported, falling back to Google Lens');
        // Fallback to Google Lens if BarcodeDetector is not supported
        const googleLensScannerUrl = 'https://lens.google.com';
        window.open(googleLensScannerUrl, '_blank');
        toast.info('נפתח סורק הברקודים');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('לא ניתן לגשת למצלמה');
      setIsScanning(false);
      setIsInitializing(false);
    }
  };

  const detectBarcode = async () => {
    if (!videoRef.current || !detectorRef.current || !isScanning) return;

    try {
      const barcodes = await detectorRef.current.detect(videoRef.current);
      console.log('Scanning frame...', barcodes.length > 0 ? 'Barcode found!' : 'No barcode detected');
      
      if (barcodes.length > 0) {
        const barcode = barcodes[0].rawValue;
        console.log('Barcode detected:', barcode);
        handleScan(barcode);
      } else {
        // Continue scanning if no barcode is detected
        requestAnimationFrame(detectBarcode);
      }
    } catch (error) {
      console.error('Detection error:', error);
      requestAnimationFrame(detectBarcode);
    }
  };

  const stopScanning = () => {
    console.log('Stopping scanner...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setIsInitializing(false);
  };

  const handleScan = (barcode: string) => {
    stopScanning();
    onScan(barcode);
    toast.success('ברקוד זוהה בהצלחה');
  };

  return (
    <div>
      <Button
        onClick={startScanning}
        size="lg"
        className="relative overflow-hidden group bg-gradient-to-r from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-8 py-6 w-full md:w-auto"
      >
        <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300" />
        <div className="relative flex items-center justify-center gap-3">
          <Camera className="w-6 h-6 animate-pulse" />
          <span className="text-lg font-medium">סרוק ברקוד</span>
        </div>
        <div className="absolute inset-0 border border-white/20 rounded-2xl" />
      </Button>

      <Dialog open={isScanning} onOpenChange={(open) => !open && stopScanning()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isInitializing ? 'מאתחל מצלמה...' : 'סריקת ברקוד'}
            </DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-lg"
              playsInline
              muted
            />
            {isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
              </div>
            )}
            <div className="absolute inset-0 border-2 border-primary/50 rounded-lg animate-pulse" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {isInitializing ? 'מאתחל את המצלמה...' : 'מחפש ברקוד...'}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};