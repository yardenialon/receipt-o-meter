import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const PriceFileTest = () => {
  const handleFetchPrices = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-supermarket-prices');
      
      if (error) {
        console.error('Error fetching prices:', error);
        toast.error('שגיאה בטעינת מחירים');
        return;
      }

      console.log('Response:', data);
      toast.success('המחירים נטענו בהצלחה');
    } catch (err) {
      console.error('Error:', err);
      toast.error('שגיאה בטעינת מחירים');
    }
  };

  const handleFetchKingstore = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-kingstore-prices');
      
      if (error) {
        console.error('Error fetching prices:', error);
        toast.error('שגיאה בטעינת מחירים');
        return;
      }

      console.log('Response:', data);
      toast.success('המחירים נטענו בהצלחה');
    } catch (err) {
      console.error('Error:', err);
      toast.error('שגיאה בטעינת מחירים');
    }
  };

  return (
    <div className="p-4 space-y-4 bg-white rounded-lg shadow-sm border">
      <h2 className="text-lg font-semibold mb-4">בדיקת מחירים</h2>
      <Button onClick={handleFetchPrices} className="w-full bg-blue-500 hover:bg-blue-600">
        טען מחירים מרשתות השיווק
      </Button>
      <Button onClick={handleFetchKingstore} variant="outline" className="w-full">
        טען מחירים מקינג סטור
      </Button>
    </div>
  );
};