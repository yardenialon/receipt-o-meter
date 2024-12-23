import { Receipt } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const ReceiptList = () => {
  const { data: receipts, isLoading } = useQuery({
    queryKey: ['receipts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

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
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-primary-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Receipt className="w-6 h-6 text-primary-500 ml-4" />
                <div>
                  <h3 className="font-medium text-gray-900">{receipt.store_name || 'חנות לא ידועה'}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(receipt.created_at).toLocaleDateString('he-IL')}
                  </p>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                ₪{receipt.total?.toFixed(2) || '0.00'}
              </p>
            </div>
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