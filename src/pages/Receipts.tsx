import ReceiptList from '@/components/ReceiptList';
import { ReceiptStats } from '@/components/stats/ReceiptStats';

export default function Receipts() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">קבלות</h1>
      </div>
      
      {/* סטטיסטיקות קבלות */}
      <ReceiptStats />
      
      {/* רשימת קבלות */}
      <ReceiptList />
    </div>
  );
}