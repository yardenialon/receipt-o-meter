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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const isMobile = useIsMobile();

  const startScanning = async () => {
    try {
      // Check if BarcodeDetector is supported
      if ('BarcodeDetector' in window) {
        setIsScanning(true);
        
        // Initialize BarcodeDetector
        detectorRef.current = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e']
        });
        
        // Get camera stream
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: isMobile ? 'environment' : 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          
          // Start detection loop when video is ready
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            detectBarcode();
          };
        }
      } else {
        // Fallback to Google Lens if BarcodeDetector is not supported
        const googleLensScannerUrl = 'https://lens.google.com';
        window.open(googleLensScannerUrl, '_blank');
        toast.info('נפתח סורק הברקודים');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('לא ניתן לגשת למצלמה');
      setIsScanning(false);
    }
  };

  const detectBarcode = async () => {
    if (!videoRef.current || !detectorRef.current || !isScanning) return;

    try {
      const barcodes = await detectorRef.current.detect(videoRef.current);
      
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
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
            <DialogTitle>סריקת ברקוד</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-lg"
              playsInline
              muted
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};