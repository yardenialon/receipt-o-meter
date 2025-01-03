import ReceiptList from '@/components/ReceiptList';
import UploadZone from '@/components/UploadZone';
import { ReceiptStats } from '@/components/stats/ReceiptStats';

export default function Index() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">הקבלות שלי</h1>
      
      <ReceiptStats />
      <UploadZone />
      <ReceiptList />
    </div>
  );
}