
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductImageGallery } from '@/components/products/images/ProductImageGallery';
import { BulkImageUpload } from '@/components/products/images/BulkImageUpload';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ProductImages = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [productList, setProductList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to load products
  const loadProducts = async (search?: string) => {
    setIsLoading(true);
    try {
      let query = supabase.from('products').select('id, name, product_code');
      
      // Add search filter if provided
      if (search && search.trim() !== '') {
        query = query.or(`name.ilike.%${search}%,product_code.ilike.%${search}%`);
      }
      
      // Limit to recent products
      query = query.order('created_at', { ascending: false }).limit(100);
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching products:', error);
        return;
      }
      
      setProductList(data || []);
    } catch (error) {
      console.error('Error in loadProducts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load products on mount and search term change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle product selection
  const handleSelectProduct = (productCode: string) => {
    setSelectedProduct(productCode);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts(searchTerm);
  };

  return (
    <div className="container mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ניהול תמונות מוצרים</h1>
          <p className="text-gray-500">הוסף, ערוך או מחק תמונות למוצרים</p>
        </div>
        <BulkImageUpload onSuccess={() => loadProducts(searchTerm)} />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>מוצרים</CardTitle>
              <CardDescription>חפש מוצר כדי לנהל את התמונות שלו</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearchSubmit} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="חפש לפי שם או קוד מוצר"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              </form>

              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>קוד מוצר</TableHead>
                      <TableHead>שם מוצר</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          טוען מוצרים...
                        </TableCell>
                      </TableRow>
                    ) : productList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          לא נמצאו מוצרים
                        </TableCell>
                      </TableRow>
                    ) : (
                      productList.map((product) => (
                        <TableRow 
                          key={product.id}
                          className={selectedProduct === product.product_code ? "bg-blue-50" : ""}
                        >
                          <TableCell className="font-mono">{product.product_code}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{product.name}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleSelectProduct(product.product_code)}
                            >
                              בחר
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedProduct ? (
            <Card>
              <CardHeader>
                <CardTitle>תמונות למוצר #{selectedProduct}</CardTitle>
                <CardDescription>נהל את תמונות המוצר</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductImageGallery productCode={selectedProduct} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium">בחר מוצר כדי לנהל את התמונות שלו</h3>
                <p className="text-gray-500 text-center max-w-md mt-2">
                  חפש מוצר ברשימה משמאל ולחץ על "בחר" כדי לצפות ולנהל את התמונות שלו
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductImages;
