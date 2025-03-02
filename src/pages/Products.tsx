
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
      // Debug: Log the supabase connection and request
      console.log('Fetching products from Supabase');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        toast.error('שגיאה בטעינת המוצרים');
        return;
      }

      console.log('Products fetched successfully:', data?.length);
      setProducts(data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
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
  console.log('Rendering products:', products);

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
