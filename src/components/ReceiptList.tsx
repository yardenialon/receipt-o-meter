import { useState } from 'react';
import { useReceipts } from './receipt/useReceipts';
import { ReceiptData } from './receipt/types';
import { ReceiptItem } from './receipt/ReceiptItem';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const ReceiptList = () => {
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(null);
  const [deletingReceiptId, setDeletingReceiptId] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState<{ [key: string]: number }>({});
  const { receipts, isLoading, error } = useReceipts(processingProgress, setProcessingProgress);

  if (error) {
    console.error('Error fetching receipts:', error);
    return (
      <div className="text-red-500 text-center mt-4">
        שגיאה בטעינת הקבלות
      </div>
    );
  }

  const handleDelete = async (receiptId: string) => {
    try {
      setDeletingReceiptId(receiptId);
      
      // Delete receipt items first
      const { error: itemsError } = await supabase
        .from('receipt_items')
        .delete()
        .eq('receipt_id', receiptId);

      if (itemsError) throw itemsError;

      // Then delete the receipt
      const { error: receiptError } = await supabase
        .from('receipts')
        .delete()
        .eq('id', receiptId);

      if (receiptError) throw receiptError;

      toast.success('הקבלה נמחקה בהצלחה');
    } catch (err) {
      console.error('Error deleting receipt:', err);
      toast.error('שגיאה במחיקת הקבלה');
    } finally {
      setDeletingReceiptId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 mt-8">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!receipts?.length) {
    return (
      <div className="text-gray-500 text-center mt-8">
        אין קבלות להצגה
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      {receipts.map((receipt: ReceiptData) => (
        <ReceiptItem
          key={receipt.id}
          receipt={receipt}
          isExpanded={expandedReceiptId === receipt.id}
          processingProgress={processingProgress[receipt.id] || 0}
          isDeleting={deletingReceiptId === receipt.id}
          onToggle={() => setExpandedReceiptId(
            expandedReceiptId === receipt.id ? null : receipt.id
          )}
          onDelete={() => handleDelete(receipt.id)}
        />
      ))}
    </div>
  );
};

export default ReceiptList;