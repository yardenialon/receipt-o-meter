import { useState } from 'react';
import { toast } from 'sonner';
import { ReceiptItem } from './receipt/ReceiptItem';
import { useReceipts } from './receipt/useReceipts';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

const ReceiptList = () => {
  const [expandedReceipts, setExpandedReceipts] = useState<string[]>([]);
  const [processingProgress, setProcessingProgress] = useState<Record<string, number>>({});
  const [isDeletingReceipt, setIsDeletingReceipt] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const { receipts, isLoading, error, deleteReceipt, deleteAllReceipts } = useReceipts(processingProgress, setProcessingProgress);

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

  const handleDeleteAll = async () => {
    try {
      setIsDeletingAll(true);
      await deleteAllReceipts();
    } finally {
      setIsDeletingAll(false);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">קבלות אחרונות</h2>
        <Button
          variant="destructive"
          onClick={handleDeleteAll}
          disabled={isDeletingAll}
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          מחק את כל הקבלות
        </Button>
      </div>
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