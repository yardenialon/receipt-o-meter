import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { BarcodeDialog } from './barcode/BarcodeDialog';
import { GoogleLensDialog } from './barcode/GoogleLensDialog';
import { useBarcodeDetection } from './barcode/useBarcodeDetection';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export const BarcodeScanner = ({ onScan }: BarcodeScannerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const {
    isScanning,
    isInitializing,
    showGoogleLens,
    videoRef,
    startScanning,
    stopScanning,
    openGoogleLens,
    setShowGoogleLens
  } = useBarcodeDetection({ onScan });

  const handleScanClick = async () => {
    setIsDialogOpen(true);
    startScanning();
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    stopScanning();
  };

  return (
    <div>
      <Button
        onClick={handleScanClick}
        size="lg"
        className="relative overflow-hidden group bg-gradient-to-r from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-8 py-6 w-full md:w-auto"
      >
        <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300" />
        <div className="relative flex items-center justify-center gap-4">
          <Camera className="w-8 h-8 md:w-10 md:h-10 animate-pulse" strokeWidth={1.5} />
          <span className="text-lg md:text-xl font-medium">סרוק ברקוד</span>
        </div>
        <div className="absolute inset-0 border border-white/20 rounded-2xl" />
      </Button>

      <BarcodeDialog
        isOpen={isDialogOpen && !showGoogleLens}
        onOpenChange={handleDialogClose}
        isInitializing={isInitializing}
        videoRef={videoRef}
      />

      <GoogleLensDialog
        isOpen={showGoogleLens}
        onOpenChange={(open) => setShowGoogleLens(open)}
        onOpenGoogleLens={openGoogleLens}
      />
    </div>
  );
};