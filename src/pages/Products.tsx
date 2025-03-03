
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsTable } from '@/components/products/ProductsTable';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, { expanded: boolean }>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // מושך מוצרים מטבלת store_products במקום טבלת products
      // מכיוון שזה היכן שנמצאים המוצרים העדכניים
      console.log('פותח חיבור ל-Supabase ומושך מוצרים מטבלת store_products');
      
      const { data: storeProductsData, error: storeProductsError } = await supabase
        .from('store_products')
        .select('product_code, product_name, manufacturer, price, store_chain, store_id')
        .limit(1000);
      
      if (storeProductsError) {
        console.error('שגיאה במשיכת מוצרים מ-store_products:', storeProductsError);
        toast.error('שגיאה בטעינת המוצרים');
        setLoading(false);
        return;
      }
      
      // אם יש מוצרים בטבלת store_products, נשתמש בהם
      if (storeProductsData && storeProductsData.length > 0) {
        console.log(`נמצאו ${storeProductsData.length} מוצרים בטבלת store_products`);
        
        // המרה למבנה הנדרש עבור component Products
        const processedProducts = storeProductsData.map(product => ({
          id: product.product_code,
          code: product.product_code,
          name: product.product_name,
          manufacturer: product.manufacturer || '',
        }));
        
        // הסרת כפילויות לפי קוד מוצר
        const uniqueProducts = Array.from(
          new Map(processedProducts.map(item => [item.code, item])).values()
        );
        
        setProducts(uniqueProducts);
        setLoading(false);
        return;
      }
      
      // אם אין מוצרים ב-store_products, ננסה למשוך מטבלת המוצרים הרגילה
      console.log('מושך מוצרים מטבלת products כגיבוי');
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (productsError) {
        console.error('שגיאה במשיכת מוצרים מ-products:', productsError);
        toast.error('שגיאה בטעינת המוצרים');
      } else {
        console.log(`נמצאו ${productsData?.length || 0} מוצרים בטבלת products`);
        setProducts(productsData || []);
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
    
    // התאמה למבנה הנדרש על ידי ProductsTable
    productsByCategory[category].push({
      productCode: product.code,
      products: [{
        product_code: product.code,
        product_name: product.name,
        manufacturer: product.manufacturer || '',
        price: 0, // מחיר ברירת מחדל
        price_update_date: product.updated_at || new Date().toISOString()
      }]
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
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={fetchProducts}
          >
            נסה שוב
          </button>
        </div>
      ) : (
        <ProductsTable 
          productsByCategory={productsByCategory} 
          expandedProducts={expandedProducts}
          onToggleExpand={handleToggleExpand}
        />
      )}
    </div>
  );
};

export default Products;
