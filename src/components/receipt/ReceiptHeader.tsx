import { Receipt, Eye, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from '@/hooks/use-mobile';

interface ReceiptHeaderProps {
  storeName: string;
  total: number;
  totalRefundable: number;
  imageUrl: string | null;
  createdAt: string;
  processingProgress?: number;
  isExpanded: boolean;
  isDeleting: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export const ReceiptHeader = ({
  storeName,
  total,
  totalRefundable,
  imageUrl,
  createdAt,
  processingProgress,
  isExpanded,
  isDeleting,
  onToggle,
  onDelete
}: ReceiptHeaderProps) => {
  const isMobile = useIsMobile();

  const handleViewImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div 
        className="flex items-center space-x-4 cursor-pointer group flex-1 min-w-[200px]"
        onClick={onToggle}
      >
        <div className="bg-primary-50 p-3 rounded-xl ml-4 group-hover:bg-primary-100 transition-colors shrink-0">
          <Receipt className="w-6 h-6 text-primary-500" />
        </div>
        <div className="min-w-0 flex-1">
          {storeName === 'מעבד...' ? (
            <>
              <h3 className="font-medium text-gray-900 truncate">מעבד את הקבלה...</h3>
              <div className={`mt-2 ${isMobile ? 'w-full' : 'w-48'}`}>
                <Progress value={processingProgress || 0} className="h-2" />
              </div>
            </>
          ) : (
            <>
              <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                {storeName || 'חנות לא ידועה'}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {new Date(createdAt).toLocaleDateString('he-IL')}
              </p>
              <p className="text-sm text-primary-600 mt-1">
                סה"כ צברת {totalRefundable?.toFixed(2) || '0'} ₪ להחזר
              </p>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <p className="text-lg font-semibold text-primary-600 whitespace-nowrap">
          ₪{total?.toFixed(2) || '0.00'}
        </p>
        {imageUrl && (
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
  );
};