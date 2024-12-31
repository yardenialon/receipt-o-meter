import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export const BarcodeScanner = ({ onScan }: BarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const isMobile = useIsMobile();
  const fileInputRef = useState<HTMLInputElement | null>(null);

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Here we would integrate with Google Lens API
        // For now, we'll just simulate finding a barcode
        const simulatedBarcode = "7290000066318"; // Example barcode
        onScan(simulatedBarcode);
        toast.success('ברקוד נסרק בהצלחה');
      } catch (err) {
        console.error('Error scanning barcode:', err);
        toast.error('שגיאה בסריקת הברקוד');
      }
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const startScanning = () => {
    if (isMobile) {
      fileInputRef.current?.click();
    } else {
      setIsScanning(true);
      // Here we would initialize web camera scanning
      // For now just show a message
      toast.info('סריקת ברקוד דרך המצלמה תתמך בקרוב');
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileInput}
      />
      <Button
        onClick={startScanning}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Camera className="w-4 h-4" />
        סרוק ברקוד
      </Button>
    </div>
  );
};