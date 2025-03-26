
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Loader2, Image } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';

export interface ProductsTableProps {
  productsByCategory: Record<string, Array<{ productCode: string, products: any[] }>>;
  expandedProducts: Record<string, { expanded: boolean }>;
  onToggleExpand: (productCode: string) => void;
  loading?: boolean;
  onSelectProduct?: (productCode: string) => void;
}

export function ProductsTable({ 
  productsByCategory, 
  expandedProducts, 
  onToggleExpand,
  loading = false,
  onSelectProduct
}: ProductsTableProps) {
  const navigate = useNavigate();
  const [categoryVisibility, setCategoryVisibility] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) => {
    setCategoryVisibility(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleProductClick = (productCode: string) => {
    navigate(`/products/${productCode}`);
  };

  const handleSelectForImage = (e: React.MouseEvent, productCode: string) => {
    e.stopPropagation();
    if (onSelectProduct) {
      onSelectProduct(productCode);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const categories = Object.keys(productsByCategory);

  if (categories.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        לא נמצאו מוצרים
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-50 p-4 border-b">
        <h3 className="text-lg font-medium">מוצרים</h3>
      </div>

      <div className="overflow-x-auto">
        {categories.map(category => (
          <div key={category} className="border-b last:border-b-0">
            <div 
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
              onClick={() => toggleCategory(category)}
            >
              <div className="flex items-center gap-2">
                {categoryVisibility[category] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="font-medium">{category}</span>
              </div>
              <span className="text-sm text-gray-500">{productsByCategory[category].length} מוצרים</span>
            </div>

            {categoryVisibility[category] && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>קוד מוצר</TableHead>
                    <TableHead>שם מוצר</TableHead>
                    <TableHead>יצרן</TableHead>
                    <TableHead>מחיר</TableHead>
                    <TableHead className="text-right">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsByCategory[category].map(({ productCode, products }) => {
                    const baseProduct = products[0];
                    const isExpanded = expandedProducts[productCode]?.expanded || false;

                    return (
                      <>
                        <TableRow 
                          key={productCode}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleProductClick(productCode)}
                        >
                          <TableCell>
                            {products.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleExpand(productCode);
                                }}
                              >
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>{productCode}</TableCell>
                          <TableCell>{baseProduct.product_name}</TableCell>
                          <TableCell>{baseProduct.manufacturer || 'לא ידוע'}</TableCell>
                          <TableCell>{formatCurrency(baseProduct.price)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-2"
                              onClick={(e) => handleSelectForImage(e, productCode)}
                            >
                              <Image className="h-3 w-3 mr-1" />
                              תמונה
                            </Button>
                          </TableCell>
                        </TableRow>
                        
                        {isExpanded && products.length > 1 && (
                          <TableRow className="bg-gray-50">
                            <TableCell colSpan={6} className="p-0">
                              <div className="p-3">
                                <h4 className="text-sm font-medium mb-2">מחירים ברשתות שונות:</h4>
                                <div className="space-y-2">
                                  {products.map((product, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                      <span>{product.store_chain} - {product.store_id}</span>
                                      <span className="font-medium">{formatCurrency(product.price)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
