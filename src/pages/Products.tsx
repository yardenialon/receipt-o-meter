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

const Products = () => {
  const { data: products, isLoading, error } = useQuery({
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
      <h1 className="text-2xl font-bold mb-6">מוצרים</h1>
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