import { Receipt, ChevronDown, ChevronUp, Trash2, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from '@/hooks/use-mobile';
import PaymentButtons from '../upload/PaymentButtons';

interface ReceiptItemProps {
  receipt: {
    id: string;
    store_name: string;
    total: number;
    total_refundable: number;
    image_url: string | null;
    created_at: string;
    receipt_items: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      refundable_amount: number;
      product_code?: string;
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
  const isMobile = useIsMobile();

  // Filter items that have all required fields
  const validItems = receipt.receipt_items.filter(item => 
    item.name && 
    typeof item.price === 'number' && 
    typeof item.quantity === 'number'
  );

  const handleViewImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (receipt.image_url) {
      window.open(receipt.image_url, '_blank');
    }
  };

  // Function to reverse the word order in Hebrew text
  const reverseHebrewText = (text: string) => {
    return text.split(' ').reverse().join(' ');
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-primary-100/50 hover:border-primary-200 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div 
          className="flex items-center space-x-4 cursor-pointer group flex-1 min-w-[200px]"
          onClick={onToggle}
        >
          <div className="bg-primary-50 p-3 rounded-xl ml-4 group-hover:bg-primary-100 transition-colors shrink-0">
            <Receipt className="w-6 h-6 text-primary-500" />
          </div>
          <div className="min-w-0 flex-1">
            {receipt.store_name === 'מעבד...' ? (
              <>
                <h3 className="font-medium text-gray-900 truncate">מעבד את הקבלה...</h3>
                <div className={`mt-2 ${isMobile ? 'w-full' : 'w-48'}`}>
                  <Progress value={processingProgress || 0} className="h-2" />
                </div>
              </>
            ) : (
              <>
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                  {receipt.store_name || 'חנות לא ידועה'}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {new Date(receipt.created_at).toLocaleDateString('he-IL')}
                </p>
                <p className="text-sm text-primary-600 mt-1">
                  סה"כ צברת {receipt.total_refundable?.toFixed(2) || '0'} ₪ להחזר
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <p className="text-lg font-semibold text-primary-600 whitespace-nowrap">
            ₪{receipt.total?.toFixed(2) || '0.00'}
          </p>
          {receipt.image_url && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleViewImage}
              className="text-gray-500 hover:text-primary-500 hover:bg-primary-50"
            >
              <Eye className="w-5 h-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
            className="text-gray-500 hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-primary-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-primary-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 border-t border-primary-100 pt-4 animate-slide-up">
          {validItems.length > 0 && (
            <div className="space-y-2 mb-4">
              {validItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm p-2 rounded-lg hover:bg-primary-50 transition-colors">
                  <span className="text-gray-700 truncate flex-1 ml-2">
                    {item.product_code && (
                      <span className="text-gray-500 ml-2">
                        מק"ט: {item.product_code}
                      </span>
                    )}
                    {reverseHebrewText(item.name)}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.quantity > 1 && (
                      <span className="text-gray-500">x{item.quantity}</span>
                    )}
                    <span className="text-primary-600 font-medium">₪{item.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <PaymentButtons />
        </div>
      )}
    </div>
  );
};