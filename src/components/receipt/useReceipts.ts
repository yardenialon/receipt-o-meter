import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ReceiptItem {
  id: string;
  receipt_id: string;
  name: string;
  price: number;
  quantity: number;
  created_at: string;
}

export interface ReceiptData {
  id: string;
  store_name: string;
  total: number;
  image_url: string;
  created_at: string;
  user_id: string;
  receipt_items: ReceiptItem[];
}

export const useReceipts = (processingProgress: Record<string, number>, setProcessingProgress: (progress: Record<string, number>) => void) => {
  const queryClient = useQueryClient();

  const { data: receipts, isLoading, error } = useQuery({
    queryKey: ['receipts'],
    queryFn: async () => {
      console.log('Fetching receipts...');
      const { data: receiptsData, error: receiptsError } = await supabase
        .from('receipts')
        .select('*, receipt_items(*)')
        .order('created_at', { ascending: false });
      
      if (receiptsError) {
        console.error('Error fetching receipts:', receiptsError);
        throw receiptsError;
      }

      // Update progress for processing receipts
      const newProgress = { ...processingProgress };
      receiptsData?.forEach(receipt => {
        if (receipt.store_name === 'מעבד...') {
          if (!processingProgress[receipt.id]) {
            newProgress[receipt.id] = 0;
          } else {
            newProgress[receipt.id] = Math.min(95, processingProgress[receipt.id] + 15);
          }
        } else {
          delete newProgress[receipt.id];
        }
      });
      setProcessingProgress(newProgress);

      console.log('Fetched receipts:', receiptsData);
      return receiptsData as ReceiptData[];
    },
    refetchInterval: (query) => {
      const data = query.state.data as ReceiptData[] | undefined;
      if (data?.some(receipt => receipt.store_name === 'מעבד...')) {
        return 2000; // Refetch every 2 seconds if processing
      }
      return false; // Stop refetching when no receipts are processing
    }
  });

  const deleteReceipt = async (receiptId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('receipts')
        .delete()
        .eq('id', receiptId);

      if (deleteError) {
        throw deleteError;
      }

      await queryClient.invalidateQueries({ queryKey: ['receipts'] });
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
        .neq('id', ''); // This will delete all receipts for the current user due to RLS

      if (deleteError) {
        throw deleteError;
      }

      await queryClient.invalidateQueries({ queryKey: ['receipts'] });
      toast.success('כל הקבלות נמחקו בהצלחה');
    } catch (err) {
      console.error('Error deleting all receipts:', err);
      toast.error('שגיאה במחיקת הקבלות');
      throw err;
    }
  };

  return {
    receipts,
    isLoading,
    error,
    deleteReceipt,
    deleteAllReceipts
  };
};