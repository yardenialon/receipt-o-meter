
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function YeinotBitanDataFetch() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<{
    status?: string;
    totalStores?: number;
    processedStores?: number;
    totalProducts?: number;
    processedProducts?: number;
  }>({});

  const fetchYeinotBitanData = async () => {
    try {
      setIsLoading(true);
      setProgress({});
      
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('fetch-yeinot-bitan-prices');
      
      if (error) {
        console.error('Error fetching Yeinot Bitan data:', error);
        toast.error('שגיאה בעדכון נתוני יינות ביתן');
        return;
      }
      
      // Start polling for progress
      const updateId = data.updateId;
      if (updateId) {
        pollProgress(updateId);
      } else {
        setIsLoading(false);
        toast.success('התחיל תהליך עדכון נתוני יינות ביתן');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('שגיאה בעדכון נתוני יינות ביתן');
      setIsLoading(false);
    }
  };
  
  const pollProgress = async (updateId: string) => {
    const intervalId = setInterval(async () => {
      const { data, error } = await supabase
        .from('price_updates')
        .select('*')
        .eq('id', updateId)
        .single();
      
      if (error) {
        console.error('Error polling progress:', error);
        clearInterval(intervalId);
        setIsLoading(false);
        return;
      }
      
      setProgress({
        status: data.status,
        totalStores: data.total_stores,
        processedStores: data.processed_stores,
        totalProducts: data.processed_products,
        processedProducts: data.processed_products
      });
      
      if (data.status === 'completed' || data.status === 'failed') {
        clearInterval(intervalId);
        setIsLoading(false);
        
        if (data.status === 'completed') {
          toast.success(`עודכנו ${data.processed_products} מוצרים מ-${data.processed_stores} סניפים של יינות ביתן`);
        } else {
          toast.error('שגיאה בעדכון נתוני יינות ביתן');
        }
      }
    }, 2000);
    
    // Cleanup
    return () => clearInterval(intervalId);
  };
  
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">עדכון נתוני יינות ביתן</h3>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          לחץ על הכפתור למטה כדי לעדכן את מחירי המוצרים של רשת יינות ביתן מ-API המחירים בזמן אמת.
          תהליך זה עשוי להימשך מספר דקות.
        </p>
        
        <Button 
          onClick={fetchYeinotBitanData} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              מעדכן נתונים...
            </>
          ) : (
            'עדכן נתוני יינות ביתן'
          )}
        </Button>
        
        {isLoading && (
          <div className="mt-4 space-y-2 text-sm">
            <p>סטטוס: {progress.status === 'processing' ? 'מעבד' : progress.status}</p>
            {progress.totalStores && (
              <p>סניפים: {progress.processedStores || 0} מתוך {progress.totalStores}</p>
            )}
            {progress.totalProducts && (
              <p>מוצרים: {progress.processedProducts || 0}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
