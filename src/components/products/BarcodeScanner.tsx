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
        toast.loading('מעבד את התמונה...');
        console.log('Starting barcode scan process for file:', file.name);
        
        // Upload the image to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(`barcodes/${Date.now()}-${file.name}`, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        console.log('File uploaded successfully:', uploadData.path);

        // Get the public URL of the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(uploadData.path);

        console.log('Processing image URL:', publicUrl);

        // Call the Edge Function to detect barcode
        const { data, error } = await supabase.functions.invoke('detect-barcode', {
          body: { imageUrl: publicUrl }
        });

        console.log('Edge function response:', data);

        if (error) {
          console.error('Edge function error:', error);
          throw error;
        }
        
        if (!data?.barcode) {
          console.error('No barcode detected in image');
          throw new Error('לא זוהה ברקוד בתמונה');
        }

        console.log('Barcode detected:', data.barcode);
        toast.dismiss();
        onScan(data.barcode);
        toast.success('ברקוד נסרק בהצלחה');

        // Clean up - delete the uploaded file
        const { error: deleteError } = await supabase.storage
          .from('receipts')
          .remove([uploadData.path]);

        if (deleteError) {
          console.error('Error deleting temporary file:', deleteError);
        }

      } catch (err) {
        toast.dismiss();
        console.error('Error scanning barcode:', err);
        toast.error(err instanceof Error ? err.message : 'שגיאה בסריקת הברקוד');
      }
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const startScanning = () => {
    fileInputRef.current?.click();
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