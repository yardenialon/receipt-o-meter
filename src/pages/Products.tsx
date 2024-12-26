import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const Products = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .order('price_update_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    }
  });

  const handleUpdatePrices = async () => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-shufersal-prices');
      
      if (error) throw error;
      
      toast.success('התחלנו לעדכן מחירים משופרסל');
      console.log('Price update response:', data);
      
      // Refetch the products after a short delay to allow for processing
      setTimeout(() => {
        refetch();
      }, 5000);
      
    } catch (err) {
      console.error('Error updating prices:', err);
      toast.error('שגיאה בעדכון המחירים');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        שגיאה בטעינת המוצרים
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">מוצרים</h1>
        <Button 
          onClick={handleUpdatePrices} 
          disabled={isUpdating}
          className="flex items-center gap-2"
        >
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
          עדכן מחירים משופרסל
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>קוד מוצר</TableHead>
              <TableHead>שם מוצר</TableHead>
              <TableHead>יצרן</TableHead>
              <TableHead>מחיר</TableHead>
              <TableHead>עודכן</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={`${product.product_code}-${product.store_chain}`}>
                <TableCell className="font-medium">{product.product_code}</TableCell>
                <TableCell>{product.product_name}</TableCell>
                <TableCell>{product.manufacturer}</TableCell>
                <TableCell>₪{product.price.toFixed(2)}</TableCell>
                <TableCell>
                  {format(new Date(product.price_update_date), 'dd/MM/yyyy HH:mm', { locale: he })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Products;