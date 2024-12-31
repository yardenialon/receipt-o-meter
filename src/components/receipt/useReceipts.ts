import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ReceiptData, ProcessingProgress } from './types';
import { useReceiptMutations } from './useReceiptMutations';
import { updateProcessingProgress } from './useProcessingProgress';

export const useReceipts = (
  processingProgress: ProcessingProgress,
  setProcessingProgress: (progress: ProcessingProgress) => void
) => {
  const queryClient = useQueryClient();
  const mutations = useReceiptMutations(queryClient);

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

      const newProgress = updateProcessingProgress(receiptsData, processingProgress);
      setProcessingProgress(newProgress);

      return receiptsData as ReceiptData[];
    },
    refetchInterval: (query) => {
      const data = query.state.data as ReceiptData[] | undefined;
      if (data?.some(receipt => receipt.store_name === 'מעבד...')) {
        return 5000;
      }
      return false;
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    receipts,
    isLoading,
    error,
    ...mutations
  };
};