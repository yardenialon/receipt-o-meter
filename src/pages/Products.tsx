
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsTable } from '@/components/products/ProductsTable';
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
}

const PRODUCTS_PER_PAGE = 50;

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, { expanded: boolean }>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // מושך מוצרים מטבלת store_products במקום טבלת products
      // מכיוון שזה היכן שנמצאים המוצרים העדכניים
      console.log('פותח חיבור ל-Supabase ומושך מוצרים מטבלת store_products');
      
      // קודם נבדוק מה המספר הכולל של מוצרים
      const countQuery = await supabase
        .from('store_products')
        .select('product_code', { count: 'exact', head: true });
      
      const totalCount = countQuery.count || 0;
      setTotalProducts(totalCount);
      console.log(`סך הכל ${totalCount} מוצרים`);
      
      // מושכים את המוצרים עם דילוג (offset) בהתאם לעמוד הנוכחי
      const { data: storeProductsData, error: storeProductsError } = await supabase
        .from('store_products')
        .select('product_code, product_name, manufacturer, price, price_update_date, store_chain, store_id')
        .range((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE - 1);
      
      if (storeProductsError) {
        console.error('שגיאה במשיכת מוצרים מ-store_products:', storeProductsError);
        toast.error('שגיאה בטעינת המוצרים');
        setLoading(false);
        return;
      }
      
      // אם יש מוצרים בטבלת store_products, נשתמש בהם
      if (storeProductsData && storeProductsData.length > 0) {
        console.log(`נמצאו ${storeProductsData.length} מוצרים בטבלת store_products בעמוד ${currentPage}`);
        
        // קיבוץ המוצרים לפי קוד מוצר
        const productsByCode = storeProductsData.reduce((acc, product) => {
          const key = product.product_code;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(product);
          return acc;
        }, {} as Record<string, any[]>);
        
        // המרה למבנה הנדרש עבור component Products
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
      
      // אם אין מוצרים ב-store_products, ננסה למשוך מטבלת המוצרים הרגילה
      console.log('מושך מוצרים מטבלת products כגיבוי');
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .range((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE - 1)
        .order('name', { ascending: true });

      if (productsError) {
        console.error('שגיאה במשיכת מוצרים מ-products:', productsError);
        toast.error('שגיאה בטעינת המוצרים');
      } else {
        console.log(`נמצאו ${productsData?.length || 0} מוצרים בטבלת products`);
        setProducts(productsData || []);
        
        // מספר המוצרים הכולל בטבלת products
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        setTotalProducts(count || 0);
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
    setExpandedProducts({}); // ריקון מצב ההרחבה בעת החלפת עמוד
  };

  // חישוב מספר העמודים הכולל
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  
  // יצירת מערך עם מספרי העמודים להצגה (עד 5 עמודים)
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // אם יש פחות מ-5 עמודים, נציג את כולם
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // אחרת נציג את העמוד הנוכחי ועד 2 עמודים לפני ואחרי
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  // הוספת לוג על תוצאות הנתונים מהשאילתה
  console.log('מציג מוצרים:', products);

  // יצירת מבנה נתונים תואם לרכיב ProductsTable
  const productsByCategory: Record<string, Array<{ productCode: string, products: any[] }>> = {};
  
  // קיבוץ המוצרים לפי קטגוריה עבור ProductsTable
  products.forEach(product => {
    const category = product.category_id || 'כללי';
    if (!productsByCategory[category]) {
      productsByCategory[category] = [];
    }
    
    // בדיקה אם יש פרטי מוצרים מפורטים (מחירים בחנויות שונות)
    const productsArray = product.productDetails || [{
      product_code: product.code,
      product_name: product.name,
      manufacturer: product.manufacturer || '',
      price: 0, // ערך ברירת מחדל
      price_update_date: product.updated_at || new Date().toISOString()
    }];
    
    // התאמה למבנה הנדרש על ידי ProductsTable
    productsByCategory[category].push({
      productCode: product.code,
      products: productsArray
    });
  });

  return (
    <div className="p-6 space-y-6">
      <ProductsHeader />
      
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
            onClick={fetchProducts}
          >
            נסה שוב
          </Button>
        </div>
      ) : (
        <>
          <ProductsTable 
            productsByCategory={productsByCategory} 
            expandedProducts={expandedProducts}
            onToggleExpand={handleToggleExpand}
            onRowClick={handleRowClick}
          />
          
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
