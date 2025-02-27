import { Badge } from "@/components/ui/badge";

interface ComparisonItemProps {
  name: string;
  price: number | null;
  quantity: number;
  isAvailable: boolean;
}

export const ComparisonItem = ({ name, price, quantity, isAvailable }: ComparisonItemProps) => {
  if (!isAvailable) {
    return (
      <div className="flex justify-between items-center py-2 text-sm text-muted-foreground" dir="rtl">
        <div className="flex items-center gap-2">
          <span>
            {name} {quantity > 1 && `(x${quantity})`}
          </span>
          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
            לא במלאי
          </Badge>
        </div>
        <span>-</span>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center py-2 text-sm" dir="rtl">
      <div className="flex items-center gap-2">
        <span>
          {name} {quantity > 1 && `(x${quantity})`}
        </span>
      </div>
      <span className="font-medium">
        ₪{(price! * quantity).toFixed(2)}
      </span>
    </div>
  );
};