import { useState } from 'react';
import { ProductsStats } from '@/components/products/ProductsStats';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsSearch } from '@/components/products/ProductsSearch';
import { PriceFileUpload } from '@/components/products/PriceFileUpload';
import { PriceFileTest } from '@/components/products/PriceFileTest';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const testRamiLevy = async () => {
    try {
      const response = await fetch('https://kthqkydgegsoheymesgc.supabase.co/functions/v1/fetch-rami-levy-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store_id: '001',
          branch_id: '089'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }

      const data = await response.json();
      
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
          <Button 
            onClick={testRamiLevy}
            variant="outline"
            className="w-full"
          >
            בדיקת מחירים מרמי לוי
          </Button>
        </div>
      </div>
      <PriceFileTest />
    </div>
  );
}