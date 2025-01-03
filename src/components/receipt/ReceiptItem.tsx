import { ReceiptHeader } from './ReceiptHeader';
import { ReceiptItemsList } from './ReceiptItemsList';
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
  // Filter items that have all required fields
  const validItems = receipt.receipt_items.filter(item => 
    item.name && 
    typeof item.price === 'number' && 
    typeof item.quantity === 'number'
  );

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-primary-100/50 hover:border-primary-200 transition-all duration-300 hover:shadow-xl">
      <ReceiptHeader
        storeName={receipt.store_name}
        total={receipt.total}
        totalRefundable={receipt.total_refundable}
        imageUrl={receipt.image_url}
        createdAt={receipt.created_at}
        processingProgress={processingProgress}
        isExpanded={isExpanded}
        isDeleting={isDeleting}
        onToggle={onToggle}
        onDelete={onDelete}
      />

      {isExpanded && (
        <div className="mt-4 border-t border-primary-100 pt-4 animate-slide-up">
          {validItems.length > 0 && (
            <ReceiptItemsList 
              items={validItems}
              storeName={receipt.store_name}
            />
          )}
          <PaymentButtons />
        </div>
      )}
    </div>
  );
};