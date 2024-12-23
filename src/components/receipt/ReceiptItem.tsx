import { Receipt, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ReceiptItemProps {
  receipt: {
    id: string;
    store_name: string;
    total: number;
    image_url: string | null;
    created_at: string;
    receipt_items: {
      id: string;
      name: string;
      price: number;
      quantity: number;
    }[];
  };
  isExpanded: boolean;
  processingProgress: number;
  isDeleting: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export const ReceiptItem = ({ 
  receipt, 
  isExpanded, 
  processingProgress, 
  isDeleting,
  onToggle, 
  onDelete 
}: ReceiptItemProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-primary-200 transition-colors">
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center space-x-4 flex-grow cursor-pointer"
          onClick={onToggle}
        >
          <Receipt className="w-6 h-6 text-primary-500 ml-4" />
          <div>
            {receipt.store_name === 'מעבד...' ? (
              <>
                <h3 className="font-medium text-gray-900">מעבד את הקבלה...</h3>
                <div className="w-48 mt-2">
                  <Progress value={processingProgress || 0} className="h-2" />
                </div>
              </>
            ) : (
              <>
                <h3 className="font-medium text-gray-900">{receipt.store_name || 'חנות לא ידועה'}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(receipt.created_at).toLocaleDateString('he-IL')}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-lg font-semibold text-gray-900">
            ₪{receipt.total?.toFixed(2) || '0.00'}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
            className="text-gray-500 hover:text-red-500"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 border-t pt-4">
          {receipt.receipt_items && receipt.receipt_items.length > 0 ? (
            <div className="space-y-2">
              {receipt.receipt_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.name}</span>
                  <div className="flex items-center gap-2">
                    {item.quantity && item.quantity > 1 && (
                      <span className="text-gray-500">x{item.quantity}</span>
                    )}
                    <span className="text-gray-900 font-medium">₪{item.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-2">
              {receipt.store_name === 'מעבד...' ? 
                'מעבד את פרטי הקבלה...' : 
                'לא נמצאו פריטים בקבלה זו'
              }
            </div>
          )}
        </div>
      )}

      {isExpanded && receipt.image_url && (
        <div className="mt-4">
          <img 
            src={receipt.image_url} 
            alt="תמונת קבלה" 
            className="w-full max-w-xs mx-auto rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              window.open(receipt.image_url, '_blank');
            }}
          />
        </div>
      )}
    </div>
  );
};