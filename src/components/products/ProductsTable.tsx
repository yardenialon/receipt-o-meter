
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriceComparison } from './PriceComparison';

interface ProductsTableProps {
  productsByCategory: Record<string, Array<{ productCode: string, products: any[] }>>;
  expandedProducts: Record<string, { expanded: boolean }>;
  onToggleExpand: (productCode: string) => void;
  onRowClick?: (productCode: string) => void;
}

export const ProductsTable = ({ 
  productsByCategory, 
  expandedProducts, 
  onToggleExpand,
  onRowClick
}: ProductsTableProps) => {
  // Debug: Log the data received in this component
  console.log('Products by category in ProductsTable:', productsByCategory);
  
  return (
    <div className="space-y-8">
      {Object.entries(productsByCategory).length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500">לא נמצאו מוצרים לתצוגה</p>
        </div>
      ) : (
        Object.entries(productsByCategory).map(([category, categoryProducts]) => (
          <div key={category} className="rounded-md border">
            <h2 className="text-xl font-semibold p-4 bg-gray-50">{category}</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>קוד מוצר</TableHead>
                  <TableHead>שם מוצר</TableHead>
                  <TableHead>יצרן</TableHead>
                  <TableHead>מחיר הכי זול</TableHead>
                  <TableHead>עודכן</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryProducts.map(({ productCode, products }) => {
                  const baseProduct = products[0];
                  const isExpanded = expandedProducts[productCode]?.expanded;
                  const prices = products.map(p => p.price).filter(price => price > 0);
                  const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
                  const latestUpdate = new Date(Math.max(...products.map(p => new Date(p.price_update_date).getTime())));

                  return (
                    <>
                      <TableRow 
                        key={productCode}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <TableCell onClick={(e) => {
                          e.stopPropagation();
                          onToggleExpand(productCode);
                        }}>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell 
                          className="font-medium"
                          onClick={() => onRowClick && onRowClick(productCode)}
                        >
                          {baseProduct.product_code}
                        </TableCell>
                        <TableCell onClick={() => onRowClick && onRowClick(productCode)}>
                          {baseProduct.product_name}
                        </TableCell>
                        <TableCell onClick={() => onRowClick && onRowClick(productCode)}>
                          {baseProduct.manufacturer}
                        </TableCell>
                        <TableCell 
                          className="font-bold text-red-600"
                          onClick={() => onRowClick && onRowClick(productCode)}
                        >
                          {lowestPrice ? `₪${lowestPrice.toFixed(2)}` : 'לא זמין'}
                        </TableCell>
                        <TableCell onClick={() => onRowClick && onRowClick(productCode)}>
                          {format(latestUpdate, 'dd/MM/yyyy HH:mm', { locale: he })}
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-gray-50 p-4">
                            <PriceComparison prices={products} />
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ))
      )}
    </div>
  );
};
