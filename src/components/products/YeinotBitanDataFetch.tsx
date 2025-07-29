
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, CheckCircle, Store } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Define the interface for price_updates table
interface PriceUpdate {
  id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  chain_name: string;
  total_stores?: number;
  processed_stores?: number;
  processed_products?: number;
  error_log?: any;
}

export function YeinotBitanDataFetch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    status?: string;
    totalStores?: number;
    processedStores?: number;
    totalProducts?: number;
    processedProducts?: number;
  }>({});
  const [updateId, setUpdateId] = useState<string | null>(null);

  const fetchYeinotBitanData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setProgress({});
      
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('fetch-yeinot-bitan-prices');
      
      if (error) {
        console.error('Error invoking fetch-yeinot-bitan-prices:', error);
        setError(error.message || 'שגיאה בעדכון נתוני יינות ביתן');
        toast.error('שגיאה בעדכון נתוני יינות ביתן');
        setIsLoading(false);
        return;
      }
      
      console.log('Function response:', data);
      
      // Start polling for progress
      const updateId = data.updateId;
      if (updateId) {
        setUpdateId(updateId);
        toast.success('התחיל תהליך עדכון נתוני יינות ביתן');
        pollProgress(updateId);
      } else {
        setIsLoading(false);
        setError('לא התקבל מזהה עדכון');
        toast.error('שגיאה בהתחלת תהליך עדכון');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'שגיאה לא ידועה');
      toast.error('שגיאה בעדכון נתוני יינות ביתן');
      setIsLoading(false);
    }
  };
  
  const pollProgress = async (updateId: string) => {
    const intervalId = setInterval(async () => {
      try {
        // Use type assertion to inform TypeScript about the expected structure
        const { data, error } = await supabase
          .from('price_updates')
          .select('*')
          .eq('id', updateId)
          .single();
          
        if (error) {
          console.error('Error polling progress:', error);
          clearInterval(intervalId);
          setIsLoading(false);
          setError('שגיאה בבדיקת סטטוס העדכון');
          return;
        }
        
        // Explicitly cast the data to our PriceUpdate interface
        const priceUpdate = data as PriceUpdate;
        
        setProgress({
          status: priceUpdate.status,
          totalStores: priceUpdate.total_stores,
          processedStores: priceUpdate.processed_stores,
          processedProducts: priceUpdate.processed_products
        });
        
        if (priceUpdate.status === 'completed' || priceUpdate.status === 'failed') {
          clearInterval(intervalId);
          setIsLoading(false);
          
          if (priceUpdate.status === 'completed') {
            toast.success(`עודכנו ${priceUpdate.processed_products} מוצרים מ-${priceUpdate.processed_stores} סניפים של יינות ביתן`);
          } else {
            setError(priceUpdate.error_log?.error || 'שגיאה לא ידועה');
            toast.error('שגיאה בעדכון נתוני יינות ביתן');
          }
        }
      } catch (error) {
        console.error('Error in polling:', error);
        clearInterval(intervalId);
        setIsLoading(false);
        setError('שגיאה בבדיקת סטטוס העדכון');
      }
    }, 2000);
    
    // Return a cleanup function
    return () => clearInterval(intervalId);
  };
  
  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100';
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100';
    }
  };
  
  const calculateProgressPercentage = () => {
    if (!progress.totalStores || !progress.processedStores) return 0;
    return Math.min(100, Math.round((progress.processedStores / progress.totalStores) * 100));
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Store className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-medium">עדכון נתוני יינות ביתן</h3>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          לחץ על הכפתור למטה כדי לעדכן את מחירי המוצרים של רשת יינות ביתן מ-API המחירים בזמן אמת.
          תהליך זה עשוי להימשך מספר דקות.
        </p>
        
        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
              <p className="font-medium">שגיאה בעדכון</p>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        <Button 
          onClick={fetchYeinotBitanData} 
          disabled={isLoading}
          className="w-full"
          variant={error ? "outline" : "default"}
        >
          {isLoading ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              מעדכן נתונים...
            </>
          ) : error ? (
            <>
              <AlertTriangle className="ml-2 h-4 w-4" />
              נסה שוב
            </>
          ) : (
            'עדכן נתוני יינות ביתן'
          )}
        </Button>
        
        {isLoading && progress.status && (
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(progress.status)}`}>
                {progress.status === 'processing' ? 'מעבד...' : 
                 progress.status === 'completed' ? 'הושלם' : 
                 progress.status === 'failed' ? 'נכשל' : progress.status}
              </div>
              
              {progress.totalStores && progress.processedStores && (
                <span className="text-sm text-gray-500">
                  {calculateProgressPercentage()}%
                </span>
              )}
            </div>
            
            {progress.totalStores && (
              <>
                <Progress 
                  value={calculateProgressPercentage()} 
                  className="h-2"
                />
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">סניפים:</span>
                    <div className="font-medium">
                      {progress.processedStores || 0} / {progress.totalStores}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">מוצרים:</span>
                    <div className="font-medium">
                      {progress.processedProducts || 0}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        
        {!isLoading && progress.status === 'completed' && (
          <div className="p-3 rounded-md bg-green-50 border border-green-200 flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div className="text-sm text-green-700">
              <p className="font-medium">העדכון הושלם בהצלחה</p>
              <p>עודכנו {progress.processedProducts} מוצרים מ-{progress.processedStores} סניפים</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
