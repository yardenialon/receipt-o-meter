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
import { Loader2, Search, Store, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import XmlUpload from '@/components/upload/XmlUpload';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ProductPrices {
  [key: string]: {
    expanded: boolean;
  }
}

const Products = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<ProductPrices>({});
  
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

  // Calculate statistics
  const totalProducts = products?.length || 0;
  const storeChains = [...new Set(products?.map(p => p.store_chain) || [])];
  const totalStoreChains = storeChains.length;

  // Filter products based on search term
  const filteredProducts = products?.filter(product => 
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group products by product code
  const groupedProducts = filteredProducts?.reduce((acc, product) => {
    if (!acc[product.product_code]) {
      acc[product.product_code] = [];
    }
    acc[product.product_code].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

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

  const toggleProductExpansion = (productCode: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productCode]: { expanded: !prev[productCode]?.expanded }
    }));
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
  const productsByCategory = groupedProducts ? Object.entries(groupedProducts).reduce((acc, [productCode, products]) => {
    const category = products[0].category || 'אחר';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ productCode, products });
    return acc;
  }, {} as Record<string, Array<{ productCode: string, products: typeof products }>>) : {};

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

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">סה״כ מוצרים</h3>
            <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">רשתות</h3>
            <p className="text-2xl font-bold text-green-600">{totalStoreChains}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">שמות הרשתות</h3>
            <p className="text-sm text-purple-600">{storeChains.join(', ')}</p>
          </div>
        </div>

        <div className="relative mb-6">
          <Input
            type="text"
            placeholder="חפש לפי שם מוצר או קטגוריה..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <XmlUpload />
      
      <div className="space-y-8 mt-8">
        {productsByCategory && Object.entries(productsByCategory).map(([category, categoryProducts]) => (
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
                  const lowestPrice = Math.min(...products.map(p => p.price));

                  return (
                    <>
                      <TableRow 
                        key={productCode}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleProductExpansion(productCode)}
                      >
                        <TableCell>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{baseProduct.product_code}</TableCell>
                        <TableCell>{baseProduct.product_name}</TableCell>
                        <TableCell>{baseProduct.manufacturer}</TableCell>
                        <TableCell className="font-bold text-red-600">
                          ₪{lowestPrice.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {baseProduct.price_update_date && 
                            format(new Date(baseProduct.price_update_date), 'dd/MM/yyyy HH:mm', { locale: he })}
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-gray-50 p-4">
                            <div className="space-y-2">
                              {products.map((product) => (
                                <div 
                                  key={`${product.store_chain}-${product.store_id}`}
                                  className={`flex justify-between items-center p-2 rounded ${
                                    product.price === lowestPrice ? 'bg-red-50' : 'bg-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                      <Store className="h-3 w-3" />
                                      {product.store_chain}
                                    </Badge>
                                    {product.store_id && (
                                      <Badge variant="outline">
                                        סניף {product.store_id}
                                      </Badge>
                                    )}
                                  </div>
                                  <span className={`font-semibold ${
                                    product.price === lowestPrice ? 'text-red-600' : ''
                                  }`}>
                                    ₪{product.price.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;