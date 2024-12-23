import { useEffect } from 'react';
import UploadZone from '../components/UploadZone';
import ReceiptList from '../components/ReceiptList';
import { Scan } from 'lucide-react';

const Index = () => {
  useEffect(() => {
    // Load Inter font
    const link = document.createElement('link');
    link.href = 'https://rsms.me/inter/inter.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in" dir="rtl">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 ml-3">CashBackly</h1>
          <Scan className="w-10 h-10 text-primary-500" />
        </div>
        
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          עקבו אחר הרגלי הקניות שלכם על ידי סריקת קבלות.
          קבלו תובנות על דפוסי ההוצאות שלכם וקבלו החלטות מושכלות.
        </p>

        <UploadZone />
        <ReceiptList />
      </div>
    </div>
  );
};

export default Index;