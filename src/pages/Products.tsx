import { useState } from 'react';
import { ProductsStats } from '@/components/products/ProductsStats';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsSearch } from '@/components/products/ProductsSearch';
import { PriceFileUpload } from '@/components/products/PriceFileUpload';
import { PriceFileTest } from '@/components/products/PriceFileTest';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const testRamiLevy = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "יש להתחבר למערכת",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('fetch-rami-levy-prices', {
        body: {
          store_id: '001',
          branch_id: '089'
        }
      });

      if (error) {
        console.error('Error fetching prices:', error);
        throw error;
      }
      
      toast({
        title: "בדיקת מחירים הושלמה",
        description: `יובאו ${data.message}`,
      });

    } catch (error) {
      console.error('Error fetching prices:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בייבוא מחירים",
        description: error instanceof Error ? error.message : 'אירעה שגיאה',
      });
    }
  };

  const testBareket = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "יש להתחבר למערכת",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('fetch-bareket-prices');

      if (error) {
        console.error('Error fetching Bareket prices:', error);
        throw error;
      }
      
      toast({
        title: "בדיקת מחירים הושלמה",
        description: data.message,
      });

    } catch (error) {
      console.error('Error fetching prices:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בייבוא מחירים",
        description: error instanceof Error ? error.message : 'אירעה שגיאה',
      });
    }
  };

  const processLocalDumps = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "יש להתחבר למערכת",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('auto-process-dumps');

      if (error) {
        console.error('Error processing dumps:', error);
        throw error;
      }
      
      toast({
        title: "עיבוד קבצים הושלם",
        description: data.message,
      });

    } catch (error) {
      console.error('Error processing dumps:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בעיבוד קבצים",
        description: error instanceof Error ? error.message : 'אירעה שגיאה',
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <ProductsHeader />
      <ProductsStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProductsSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <div className="space-y-4">
          <PriceFileUpload />
          <div className="flex gap-4">
            <Button 
              onClick={testRamiLevy}
              variant="outline"
              className="flex-1"
            >
              בדיקת מחירים מרמי לוי
            </Button>
            <Button 
              onClick={testBareket}
              variant="outline"
              className="flex-1"
            >
              בדיקת מחירים מברקת
            </Button>
            <Button 
              onClick={processLocalDumps}
              variant="outline"
              className="flex-1"
            >
              עיבוד קבצים מקומיים
            </Button>
          </div>
        </div>
      </div>
      <PriceFileTest />
    </div>
  );
}
