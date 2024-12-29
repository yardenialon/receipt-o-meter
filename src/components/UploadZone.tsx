import { useState } from 'react';
import { uploadReceiptToSupabase } from '@/lib/supabase-upload';
import { supabase } from '@/lib/supabase';
import CameraCapture from './upload/CameraCapture';
import DropZone from './upload/DropZone';
import PaymentButtons from './upload/PaymentButtons';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const UploadZone = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [networkName, setNetworkName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [pendingFile, setPendingFile] = useState<Blob | null>(null);
  const queryClient = useQueryClient();

  const handleFile = async (file: Blob) => {
    // Check file size
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error('הקובץ גדול מדי. גודל מקסימלי הוא 5MB');
      return;
    }

    setPendingFile(file);
    setShowDialog(true);
  };

  const handleConfirm = async () => {
    if (!networkName || !branchName) {
      toast.error('אנא הזן שם רשת ושם סניף');
      return;
    }

    if (!pendingFile) {
      toast.error('לא נבחר קובץ');
      return;
    }

    setIsUploading(true);
    try {
      const { publicUrl, receiptId } = await uploadReceiptToSupabase(pendingFile);
      
      if (publicUrl && receiptId) {
        console.log('Starting OCR processing for receipt:', receiptId);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No session found');
        }

        // Convert Blob to base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1]); // Remove data URL prefix
          };
          reader.readAsDataURL(pendingFile);
        });

        console.log('Sending OCR request for receipt:', receiptId);
        const { data, error } = await supabase.functions.invoke('process-receipt', {
          body: {
            base64Image: base64,
            receiptId: receiptId,
            contentType: pendingFile.type,
            isPDF: pendingFile.type === 'application/pdf',
            networkName: networkName,
            branchName: branchName
          }
        });

        if (error) {
          console.error('OCR processing error:', error);
          
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
          
          throw error;
        }

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

        // Invalidate and refetch receipts query after successful upload
        await queryClient.invalidateQueries({ queryKey: ['receipts'] });
        setShowDialog(false);
        setPendingFile(null);
        setNetworkName('');
        setBranchName('');
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>פרטי הרשת והסניף</DialogTitle>
            <DialogDescription>
              אנא הזן את שם הרשת ושם הסניף עבור הקובץ
              {pendingFile && (
                <div className="mt-2 text-sm text-gray-500">
                  שם הקובץ: {pendingFile.name}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="networkName">שם הרשת</Label>
              <Input
                id="networkName"
                value={networkName}
                onChange={(e) => setNetworkName(e.target.value)}
                placeholder="לדוגמה: שופרסל"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchName">שם הסניף</Label>
              <Input
                id="branchName"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="לדוגמה: סניף רמת אביב"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleConfirm}
              disabled={!networkName || !branchName || isUploading}
            >
              {isUploading ? 'מעלה...' : 'אישור'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadZone;