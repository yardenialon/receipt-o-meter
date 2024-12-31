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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Upload the image to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(`barcodes/${Date.now()}-${file.name}`, file);

        if (uploadError) throw uploadError;

        // Get the public URL of the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(uploadData.path);

        // Call the Edge Function to detect barcode
        const { data, error } = await supabase.functions.invoke('detect-barcode', {
          body: { imageUrl: publicUrl }
        });

        if (error) throw error;
        if (!data?.barcode) throw new Error('No barcode detected');

        onScan(data.barcode);
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