import { useState } from 'react';
import { uploadReceiptToSupabase } from '@/lib/supabase-upload';
import { supabase } from '@/lib/supabase';
import CameraCapture from './upload/CameraCapture';
import DropZone from './upload/DropZone';
import PaymentButtons from './upload/PaymentButtons';
import { toast } from 'sonner';

const UploadZone = () => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: Blob) => {
    setIsUploading(true);
    try {
      const { publicUrl, receiptId } = await uploadReceiptToSupabase(file);
      
      if (publicUrl && receiptId) {
        console.log('Starting OCR processing for receipt:', receiptId);
        // Process receipt with OCR
        const formData = new FormData();
        formData.append('file', file);
        formData.append('receiptId', receiptId);

        const { data: { session } } = await supabase.auth.getSession();
        const { data, error } = await supabase.functions.invoke('process-receipt', {
          body: formData,
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (error) {
          console.error('OCR processing error:', error);
          toast.error('שגיאה בעיבוד הקבלה: ' + (error.message || 'אנא נסה שוב'));
          
          // Update receipt status to error
          const { error: updateError } = await supabase
            .from('receipts')
            .update({ 
              store_name: 'שגיאה בעיבוד',
              total: 0
            })
            .eq('id', receiptId);
            
          if (updateError) {
            console.error('Error updating receipt status:', updateError);
          }
        } else {
          console.log('OCR processing result:', data);
          if (data?.items?.length > 0) {
            toast.success(`זוהו ${data.items.length} פריטים בקבלה`);
          } else {
            toast.error('לא זוהו פריטים בקבלה. אנא נסה להעלות תמונה ברורה יותר');
            
            // Update receipt status for no items found
            const { error: updateError } = await supabase
              .from('receipts')
              .update({ 
                store_name: 'לא זוהו פריטים',
                total: 0
              })
              .eq('id', receiptId);
              
            if (updateError) {
              console.error('Error updating receipt status:', updateError);
            }
          }
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('שגיאה בהעלאת הקבלה: ' + (err instanceof Error ? err.message : 'אנא נסה שוב'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <DropZone onFileDrop={handleFile} isUploading={isUploading} />
      
      <div className="flex flex-col items-center gap-4">
        <CameraCapture onPhotoCapture={handleFile} />
        <PaymentButtons />
      </div>
    </div>
  );
};

export default UploadZone;