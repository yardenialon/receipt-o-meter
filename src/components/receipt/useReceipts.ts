import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ReceiptItem {
  id: string;
  receipt_id: string;
  name: string;
  price: number;
  quantity: number;
  refundable_amount: number;
  created_at: string;
}

export interface ReceiptData {
  id: string;
  store_name: string;
  total: number;
  total_refundable: number;
  image_url: string | null;
  created_at: string;
  user_id: string;
  receipt_items: ReceiptItem[];
}

export const useReceipts = (processingProgress: Record<string, number>, setProcessingProgress: (progress: Record<string, number>) => void) => {
  const queryClient = useQueryClient();

  const { data: receipts, isLoading, error } = useQuery({
    queryKey: ['receipts'],
    queryFn: async () => {
      const { data: receiptsData, error: receiptsError } = await supabase
        .from('receipts')
        .select('*, receipt_items(*)')
        .order('created_at', { ascending: false });
      
      if (receiptsError) {
        console.error('Error fetching receipts:', receiptsError);
        throw receiptsError;
      }

      // Update progress only for receipts that are still processing
      const newProgress = { ...processingProgress };
      receiptsData?.forEach(receipt => {
        if (receipt.store_name === 'מעבד...') {
          if (!processingProgress[receipt.id]) {
            newProgress[receipt.id] = 0;
          } else {
            // Increment progress more slowly
            newProgress[receipt.id] = Math.min(95, processingProgress[receipt.id] + 5);
          }
        } else {
          delete newProgress[receipt.id];
        }
      });
      setProcessingProgress(newProgress);

      return receiptsData as ReceiptData[];
    },
    refetchInterval: (query) => {
      const data = query.state.data as ReceiptData[] | undefined;
      // Only refetch if there are processing receipts
      if (data?.some(receipt => receipt.store_name === 'מעבד...')) {
        return 5000; // Refetch every 5 seconds instead of 2 seconds
      }
      return false;
    },
    // Add staleTime to prevent unnecessary refetches
    staleTime: 1000 * 30, // Data stays fresh for 30 seconds
    // Add cacheTime to keep data in cache longer
    gcTime: 1000 * 60 * 5, // Keep unused data in cache for 5 minutes
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
        .neq('id', '');

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
