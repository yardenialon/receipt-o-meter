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
import XmlUpload from '@/components/upload/XmlUpload';

const Products = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .order('category')
        .order('price_update_date', { ascending: false });

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

  // Group products by category
  const productsByCategory = products?.reduce((acc, product) => {
    const category = product.category || 'אחר';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

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

      <XmlUpload />
      
      <div className="space-y-8 mt-8">
        {productsByCategory && Object.entries(productsByCategory).map(([category, categoryProducts]) => (
          <div key={category} className="rounded-md border">
            <h2 className="text-xl font-semibold p-4 bg-gray-50">{category}</h2>
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
                {categoryProducts.map((product) => (
                  <TableRow key={`${product.product_code}-${product.store_chain}`}>
                    <TableCell className="font-medium">{product.product_code}</TableCell>
                    <TableCell>{product.product_name}</TableCell>
                    <TableCell>{product.manufacturer}</TableCell>
                    <TableCell>₪{product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {product.price_update_date && format(new Date(product.price_update_date), 'dd/MM/yyyy HH:mm', { locale: he })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;