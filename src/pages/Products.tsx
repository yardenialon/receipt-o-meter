import { useState } from 'react';
import { ProductsStats } from '@/components/products/ProductsStats';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsSearch } from '@/components/products/ProductsSearch';
import { PriceFileUpload } from '@/components/products/PriceFileUpload';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleKeshetFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's a CSV file
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "יש להעלות קובץ CSV בלבד",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('process-keshet-csv', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: "העלאה הצליחה",
        description: data.message,
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בהעלאת הקובץ",
        description: error instanceof Error ? error.message : 'אירעה שגיאה',
      });
    } finally {
      setIsUploading(false);
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
          <div className="p-4 border rounded-lg bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-4">העלאת מוצרי רשת קשת</h3>
            <p className="text-sm text-gray-600 mb-4">
              העלה קובץ CSV המכיל את מוצרי רשת קשת. המערכת תעבד את הקובץ ותעדכן את מחירי המוצרים באופן אוטומטי.
            </p>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="relative"
                disabled={isUploading}
              >
                {isUploading ? 'מעלה...' : 'העלה קובץ CSV'}
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleKeshetFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}