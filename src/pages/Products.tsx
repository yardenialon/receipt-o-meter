
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsTable } from '@/components/products/ProductsTable';
import { ProductsGrid } from '@/components/products/ProductsGrid';
import { ProductsSearchBar } from '@/components/products/ProductsSearchBar';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Product {
  id: string;
  code: string;
  name: string;
  manufacturer?: string;
  category_id?: string;
  created_at?: string;
  updated_at?: string;
  description?: string;
  is_weighted?: boolean;
  unit_type?: string;
  productDetails?: any[]; // Adding the property for product details
}

const PRODUCTS_PER_PAGE = 50;

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, { expanded: boolean }>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm]);

  // Helper function to safely parse date strings
  const safeParseDate = (dateStr: string | null | undefined): Date => {
    if (!dateStr) return new Date();
    
    try {
      const date = new Date(dateStr);
      // Check if valid date
      if (isNaN(date.getTime())) {
        return new Date(); // Return current date if invalid
      }
      return date;
    } catch (error) {
      console.error('Invalid date format:', dateStr, error);
      return new Date(); // Return current date if parsing fails
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('פותח חיבור ל-Supabase ומושך מוצרים מטבלת store_products');
      
      // Build the query based on search term
      let query = supabase
        .from('store_products')
        .select('product_code, product_name, manufacturer, price, price_update_date, store_chain, store_id');
      
      // Apply search filter if needed
      if (searchTerm) {
        // Check if searchTerm is a product code (typically numeric)
        if (/^\d+$/.test(searchTerm)) {
          query = query.ilike('product_code', `%${searchTerm}%`);
        } else {
          query = query.ilike('product_name', `%${searchTerm}%`);
        }
      }
      
      // Get total count
      let totalCount = 0;
      if (searchTerm) {
        const { count: searchCount, error: countError } = await query
          .select('product_code', { head: true, count: 'exact' });
        if (countError) {
          console.error('שגיאה בספירת מוצרים:', countError);
        } else {
          totalCount = searchCount || 0;
        }
      } else {
        const { count: allCount, error: countError } = await supabase
          .from('store_products')
          .select('product_code', { head: true, count: 'exact' });
        if (countError) {
          console.error('שגיאה בספירת מוצרים:', countError);
        } else {
          totalCount = allCount || 0;
        }
      }
      
      setTotalProducts(totalCount);
      console.log(`סך הכל ${totalCount} מוצרים`);
      
      // Get paginated results
      const { data: storeProductsData, error: storeProductsError } = await query
        .range((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE - 1);
      
      if (storeProductsError) {
        console.error('שגיאה במשיכת מוצרים מ-store_products:', storeProductsError);
        toast.error('שגיאה בטעינת המוצרים');
        setLoading(false);
        return;
      }
      
      // If there are products in store_products, use them
      if (storeProductsData && storeProductsData.length > 0) {
        console.log(`נמצאו ${storeProductsData.length} מוצרים בטבלת store_products בעמוד ${currentPage}`);
        
        // Collect products by code
        const productsByCode = storeProductsData.reduce((acc, product) => {
          const key = product.product_code;
          if (!acc[key]) {
            acc[key] = [];
          }
          
          // Ensure price_update_date is always valid
          const safeProduct = {
            ...product,
            price_update_date: product.price_update_date ? safeParseDate(product.price_update_date).toISOString() : new Date().toISOString()
          };
          
          acc[key].push(safeProduct);
          return acc;
        }, {} as Record<string, any[]>);
        
        // Convert to the required structure for Products component
        const processedProducts = Object.values(productsByCode).map(productsGroup => {
          const baseProduct = productsGroup[0];
          return {
            id: baseProduct.product_code,
            code: baseProduct.product_code,
            name: baseProduct.product_name,
            manufacturer: baseProduct.manufacturer || '',
            productDetails: productsGroup
          };
        });
        
        console.log(`עיבוד ${processedProducts.length} מוצרים ייחודיים לתצוגה`);
        setProducts(processedProducts);
        setLoading(false);
        return;
      }
      
      // If no products in store_products, try fetching from products table as backup
      console.log('מושך מוצרים מטבלת products כגיבוי');
      
      // Build the query based on search term for products table
      let productsQuery = supabase
        .from('products')
        .select('*');
      
      // Apply search filter if needed
      if (searchTerm) {
        // Check if searchTerm is a product code (typically numeric)
        if (/^\d+$/.test(searchTerm)) {
          productsQuery = productsQuery.ilike('code', `%${searchTerm}%`);
        } else {
          productsQuery = productsQuery.ilike('name', `%${searchTerm}%`);
        }
      }
      
      // Get paginated results
      const { data: productsData, error: productsError } = await productsQuery
        .range((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE - 1)
        .order('name', { ascending: true });

      if (productsError) {
        console.error('שגיאה במשיכת מוצרים מ-products:', productsError);
        toast.error('שגיאה בטעינת המוצרים');
      } else {
        console.log(`נמצאו ${productsData?.length || 0} מוצרים בטבלת products`);
        
        // Process the products data to ensure valid dates
        const processedProductsData = (productsData || []).map(product => ({
          ...product,
          updated_at: product.updated_at ? safeParseDate(product.updated_at).toISOString() : new Date().toISOString(),
          created_at: product.created_at ? safeParseDate(product.created_at).toISOString() : new Date().toISOString()
        }));
        
        setProducts(processedProductsData);
        
        // Number of products in products table
        const { count: productsCount, error: countError } = await supabase
          .from('products')
          .select('*', { head: true, count: 'exact' });
        
        if (countError) {
          console.error('שגיאה בספירת מוצרים:', countError);
        } else {
          setTotalProducts(productsCount || 0);
        }
      }
    } catch (error) {
      console.error('שגיאה כללית בטעינת המוצרים:', error);
      toast.error('שגיאה בטעינת המוצרים');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (productCode: string) => {
    navigate(`/products/${productCode}`);
  };

  const handleToggleExpand = (productCode: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productCode]: { expanded: !prev[productCode]?.expanded }
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedProducts({}); // Reset expanded state when changing page
  };
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  const handleViewChange = (view: 'list' | 'grid') => {
    setViewMode(view);
  };

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  console.log('מציג מוצרים:', products);

  const productsByCategory: Record<string, Array<{ productCode: string, products: any[] }>> = {};
  
  products.forEach(product => {
    const category = product.category_id || 'כללי';
    if (!productsByCategory[category]) {
      productsByCategory[category] = [];
    }
    
    const productsArray = product.productDetails || [{
      product_code: product.code,
      product_name: product.name,
      manufacturer: product.manufacturer || '',
      price: 0,
      price_update_date: product.updated_at || new Date().toISOString()
    }];
    
    productsByCategory[category].push({
      productCode: product.code,
      products: productsArray
    });
  });
  
  const flattenedProducts = Object.values(productsByCategory).flat();

  return (
    <div className="p-6 space-y-6">
      <ProductsHeader />
      
      <ProductsSearchBar 
        onSearch={handleSearch}
        onViewChange={handleViewChange}
        currentView={viewMode}
      />
      
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2">טוען מוצרים...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">לא נמצאו מוצרים</p>
          <Button 
            className="mt-4"
            onClick={() => {
              setSearchTerm('');
              fetchProducts();
            }}
          >
            נסה שוב
          </Button>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <ProductsTable 
              productsByCategory={productsByCategory} 
              expandedProducts={expandedProducts}
              onToggleExpand={handleToggleExpand}
              onRowClick={handleRowClick}
            />
          ) : (
            <ProductsGrid products={flattenedProducts} />
          )}
          
          {totalPages > 1 && (
            <Pagination className="mt-6 flex justify-center">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }} 
                    className={currentPage === 1 ? "opacity-50 pointer-events-none" : ""}
                  />
                </PaginationItem>
                
                {currentPage > 3 && (
                  <>
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(1);
                        }}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  </>
                )}
                
                {getPageNumbers().map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      href="#" 
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                {currentPage < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(totalPages);
                        }}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "opacity-50 pointer-events-none" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
