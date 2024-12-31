import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export const BarcodeScanner = ({ onScan }: BarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const isMobile = useIsMobile();

  const openGoogleLens = () => {
    // Google Lens URL for barcode scanning
    const googleLensUrl = 'https://lens.google.com/';
    
    // Check if it's a mobile device
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // For mobile devices, try to open the Google Lens app
      window.location.href = 'googlelens://scan';
      
      // Fallback to web version after a short delay if app doesn't open
      setTimeout(() => {
        window.location.href = googleLensUrl;
      }, 500);
    } else {
      // For desktop, open Google Lens in a new tab
      window.open(googleLensUrl, '_blank');
    }

    toast.info('נפתח Google Lens לסריקת הברקוד');
  };

  return (
    <div>
      <Button
        onClick={openGoogleLens}
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
    </div>
  );
};