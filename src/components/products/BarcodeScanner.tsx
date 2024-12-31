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
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from '@/lib/supabase';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export const BarcodeScanner = ({ onScan }: BarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showGoogleLens, setShowGoogleLens] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const isMobile = useIsMobile();

  const openGoogleLens = () => {
    const googleLensScannerUrl = 'https://lens.google.com';
    window.open(googleLensScannerUrl, '_blank');
    toast.info('נפתח סורק Google Lens בחלון חדש');
    setShowGoogleLens(false);
  };

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
      } else {
        console.log('No product found with barcode:', barcode);
        return null;
      }
    } catch (error) {
      console.error('Error in findProductByBarcode:', error);
      toast.error('שגיאה בחיפוש המוצר');
      return null;
    }
  };

  const startScanning = async () => {
    try {
      setIsInitializing(true);
      console.log('Starting barcode scanner...');
      
      if ('BarcodeDetector' in window) {
        setIsScanning(true);
        
        console.log('Initializing BarcodeDetector...');
        detectorRef.current = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e']
        });
        
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
          
          videoRef.current.onloadedmetadata = () => {
            console.log('Video stream ready, starting detection...');
            videoRef.current?.play();
            detectBarcode();
            setIsInitializing(false);
            toast.success('מצלמה מוכנה לסריקה');
          };
        }
      } else {
        console.log('BarcodeDetector not supported, showing Google Lens option');
        setShowGoogleLens(true);
        setIsInitializing(false);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('לא ניתן לגשת למצלמה');
      setShowGoogleLens(true);
      setIsScanning(false);
      setIsInitializing(false);
    }
  };

  const detectBarcode = async () => {
    if (!videoRef.current || !detectorRef.current || !isScanning) return;

    try {
      const barcodes = await detectorRef.current.detect(videoRef.current);
      
      if (barcodes.length > 0) {
        const barcode = barcodes[0].rawValue;
        console.log('Barcode detected:', barcode);
        
        const product = await findProductByBarcode(barcode);
        if (product) {
          handleScan(barcode);
          toast.success('מוצר נמצא!');
        } else {
          toast.error('לא נמצא מוצר עם ברקוד זה');
          requestAnimationFrame(detectBarcode);
        }
      } else {
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
    setShowGoogleLens(false);
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

      <Dialog open={showGoogleLens} onOpenChange={(open) => !open && setShowGoogleLens(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>סריקת ברקוד באמצעות Google Lens</DialogTitle>
            <DialogDescription>
              לא ניתן להשתמש בסורק המובנה. האם תרצה להשתמש ב-Google Lens לסריקת הברקוד?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setShowGoogleLens(false)}>
              ביטול
            </Button>
            <Button onClick={openGoogleLens}>
              פתח את Google Lens
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};