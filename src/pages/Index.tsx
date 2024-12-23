import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import UploadZone from '../components/UploadZone';
import ReceiptList from '../components/ReceiptList';
import { LogOut, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/login');
      }
    });
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-white p-3 rounded-2xl shadow-lg animate-scale-in">
              <Receipt className="w-8 h-8 text-primary-500" />
            </div>
            <div className="animate-slide-up">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                CashBackly
              </h1>
              <p className="text-primary-700 text-sm">מערכת חכמה לניהול קבלות</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            התנתק
          </Button>
        </div>
        
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            נהלו את הקבלות שלכם בקלות
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            סרקו קבלות, קבלו תובנות על ההוצאות שלכם וקבלו החזרים כספיים בקלות
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl mb-12 animate-scale-in">
          <UploadZone />
        </div>

        <div className="animate-slide-up">
          <ReceiptList />
        </div>
      </div>
    </div>
  );
};

export default Index;