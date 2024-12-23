import { Receipt, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { toast } from 'sonner';

const ReceiptList = () => {
  const [expandedReceipts, setExpandedReceipts] = useState<string[]>([]);

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

      console.log('Fetched receipts:', receiptsData);
      return receiptsData;
    }
  });

  const toggleReceipt = (receiptId: string) => {
    setExpandedReceipts(prev => 
      prev.includes(receiptId)
        ? prev.filter(id => id !== receiptId)
        : [...prev, receiptId]
    );
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
        {receipts.map((receipt) => (
          <div
            key={receipt.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-primary-200 transition-colors"
          >
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleReceipt(receipt.id)}
            >
              <div className="flex items-center space-x-4">
                <Receipt className="w-6 h-6 text-primary-500 ml-4" />
                <div>
                  <h3 className="font-medium text-gray-900">{receipt.store_name || 'חנות לא ידועה'}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(receipt.created_at).toLocaleDateString('he-IL')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-lg font-semibold text-gray-900">
                  ₪{receipt.total?.toFixed(2) || '0.00'}
                </p>
                {expandedReceipts.includes(receipt.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </div>

            {expandedReceipts.includes(receipt.id) && (
              <div className="mt-4 border-t pt-4">
                {receipt.receipt_items && receipt.receipt_items.length > 0 ? (
                  <div className="space-y-2">
                    {receipt.receipt_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="text-gray-900 font-medium">₪{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-2">
                    לא נמצאו פריטים בקבלה זו
                  </div>
                )}
              </div>
            )}

            {receipt.image_url && (
              <img 
                src={receipt.image_url} 
                alt="תמונת קבלה" 
                className="mt-4 w-full max-w-xs mx-auto rounded-lg shadow-sm"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReceiptList;