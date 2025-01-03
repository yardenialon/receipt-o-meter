import ReceiptList from '@/components/ReceiptList';
import UploadZone from '@/components/UploadZone';
import { ReceiptStats } from '@/components/stats/ReceiptStats';

export default function Index() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          הקבלות שלי
        </h1>
        <p className="text-gray-600 mb-8">
          צלם או העלה את הקבלות שלך לקבלת החזרים והמלצות לחיסכון
        </p>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-primary-100/50 p-8">
          <ReceiptStats />
          <UploadZone />
        </div>
        
        <ReceiptList />
      </div>
    </div>
  );
}