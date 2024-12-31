import { ReceiptData, ProcessingProgress } from './types';

export const updateProcessingProgress = (
  receiptsData: ReceiptData[] | undefined,
  currentProgress: ProcessingProgress
): ProcessingProgress => {
  const newProgress = { ...currentProgress };
  
  receiptsData?.forEach(receipt => {
    if (receipt.store_name === 'מעבד...') {
      if (!currentProgress[receipt.id]) {
        newProgress[receipt.id] = 0;
      } else {
        newProgress[receipt.id] = Math.min(95, currentProgress[receipt.id] + 5);
      }
    } else {
      delete newProgress[receipt.id];
    }
  });

  return newProgress;
};