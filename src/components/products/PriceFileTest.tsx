import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const PriceFileTest = () => {
  const handleFetchPrices = async () => {
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
    <div className="p-4">
      <Button onClick={handleFetchPrices}>
        טען מחירים מקינג סטור
      </Button>
    </div>
  );
};