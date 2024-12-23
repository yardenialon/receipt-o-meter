import { useState } from 'react';
import { toast } from 'sonner';
import { ReceiptItem } from './receipt/ReceiptItem';
import { useReceipts } from './receipt/useReceipts';

const ReceiptList = () => {
  const [expandedReceipts, setExpandedReceipts] = useState<string[]>([]);
  const [processingProgress, setProcessingProgress] = useState<Record<string, number>>({});
  const [isDeletingReceipt, setIsDeletingReceipt] = useState<string | null>(null);

  const { receipts, isLoading, error, deleteReceipt } = useReceipts(processingProgress, setProcessingProgress);

  const toggleReceipt = (receiptId: string) => {
    setExpandedReceipts(prev => 
      prev.includes(receiptId)
        ? prev.filter(id => id !== receiptId)
        : [...prev, receiptId]
    );
  };

  const handleDelete = async (receiptId: string) => {
    try {
      setIsDeletingReceipt(receiptId);
      await deleteReceipt(receiptId);
    } finally {
      setIsDeletingReceipt(null);
    }
  };

  if (error) {
    console.error('Error in ReceiptList:', error);
    toast.error('שגיאה בטעינת הקבלות');
    return (
      <div className="mt-12 text-center text-red-500">
        שגיאה בטעינת הקבלות
      </div>
    );
  }

  if (isLoading) {
    return <div className="mt-12 text-center">טוען קבלות...</div>;
  }

  if (!receipts?.length) {
    return (
      <div className="mt-12 text-center text-gray-500">
        לא נמצאו קבלות
      </div>
    );
  }

  return (
    <div className="mt-12 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">קבלות אחרונות</h2>
      <div className="space-y-4">
        {receipts?.map((receipt) => (
          <ReceiptItem
            key={receipt.id}
            receipt={receipt}
            isExpanded={expandedReceipts.includes(receipt.id)}
            processingProgress={processingProgress[receipt.id]}
            isDeleting={isDeletingReceipt === receipt.id}
            onToggle={() => toggleReceipt(receipt.id)}
            onDelete={() => handleDelete(receipt.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ReceiptList;