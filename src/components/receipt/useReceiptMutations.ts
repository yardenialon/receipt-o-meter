import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { QueryClient } from '@tanstack/react-query';
import { ReceiptData } from './types';

export const useReceiptMutations = (queryClient: QueryClient) => {
  const deleteReceipt = async (receiptId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('receipts')
        .delete()
        .eq('id', receiptId);

      if (deleteError) {
        throw deleteError;
      }

      queryClient.setQueryData(['receipts'], (oldData: ReceiptData[] | undefined) => {
        return oldData?.filter(receipt => receipt.id !== receiptId);
      });
      
      toast.success('הקבלה נמחקה בהצלחה');
    } catch (err) {
      console.error('Error deleting receipt:', err);
      toast.error('שגיאה במחיקת הקבלה');
      throw err;
    }
  };

  const deleteAllReceipts = async () => {
    try {
      const { error: deleteError } = await supabase
        .from('receipts')
        .delete()
        .neq('id', '');

      if (deleteError) {
        throw deleteError;
      }

      queryClient.setQueryData(['receipts'], []);
      toast.success('כל הקבלות נמחקו בהצלחה');
    } catch (err) {
      console.error('Error deleting all receipts:', err);
      toast.error('שגיאה במחיקת הקבלות');
      throw err;
    }
  };

  return {
    deleteReceipt,
    deleteAllReceipts
  };
};