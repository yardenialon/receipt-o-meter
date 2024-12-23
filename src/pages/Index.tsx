import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import UploadZone from '../components/UploadZone';
import ReceiptList from '../components/ReceiptList';
import { Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/login');
      }
    });

    // Load Inter font
    const link = document.createElement('link');
    link.href = 'https://rsms.me/inter/inter.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <h1 className="text-4xl font-bold text-gray-900 ml-3">CashBackly</h1>
            <Scan className="w-10 h-10 text-primary-500" />
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            התנתק
          </Button>
        </div>
        
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto text-center">
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