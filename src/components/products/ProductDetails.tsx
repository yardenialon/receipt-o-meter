
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ProductImages } from './ProductImages';
import { PriceComparison } from './PriceComparison';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  manufacturer?: string;
}

interface StoreProduct {
  product_code: string;
  product_name: string;
  manufacturer?: string;
  price: number;
  price_update_date: string;
  store_chain: string;
  store_id: string;
  store_name?: string;
  store_address?: string | null;
}

export const ProductDetails = () => {
  const { productCode } = useParams<{ productCode: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [prices, setPrices] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productCode) return;
      
      setLoading(true);
      try {
        console.log('מושך פרטי מוצר עבור קוד:', productCode);
        
        // 1. נחפש בטבלת store_products
        const { data: storeProductsData, error: storeProductsError } = await supabase
          .from('store_products')
          .select('product_code, product_name, manufacturer, price, price_update_date, store_chain, store_id')
          .eq('product_code', productCode);

        if (storeProductsError) {
          console.error('שגיאה במשיכת פרטי מוצר מ-store_products:', storeProductsError);
          toast.error('שגיאה בטעינת פרטי מוצר');
        }
        
        // אם נמצאו תוצאות ב-store_products
        if (storeProductsData && storeProductsData.length > 0) {
          console.log(`נמצאו ${storeProductsData.length} מופעים של המוצר בטבלת store_products`);
          
          // הגדרת פרטי מוצר בסיסיים
          const baseProduct = storeProductsData[0];
          setProduct({
            id: baseProduct.product_code,
            code: baseProduct.product_code,
            name: baseProduct.product_name,
            manufacturer: baseProduct.manufacturer
          });
          
          // שמירת כל המחירים
          setPrices(storeProductsData);
          setLoading(false);
          return;
        }
        
        // 2. אם לא נמצא ב-store_products, נחפש בטבלת products
        console.log('מוצר לא נמצא ב-store_products, בודק בטבלת products');
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('code', productCode)
          .single();

        if (productError) {
          console.error('שגיאה במשיכת פרטי מוצר מ-products:', productError);
          toast.error('שגיאה בטעינת פרטי מוצר');
          setLoading(false);
          return;
        }

        setProduct(productData);
        setLoading(false);
      } catch (error) {
        console.error('שגיאה כללית בטעינת פרטי מוצר:', error);
        toast.error('שגיאה בטעינת פרטי מוצר');
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productCode]);

  const handleBack = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2">טוען פרטי מוצר...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">לא נמצא מוצר עם הקוד {productCode}</p>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="ml-2 h-4 w-4" /> חזרה לרשימת המוצרים
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Button onClick={handleBack} variant="outline" className="mb-4">
        <ArrowLeft className="ml-2 h-4 w-4" /> חזרה לרשימת המוצרים
      </Button>
      
      <div>
        <h2 className="text-2xl font-bold">{product.name}</h2>
        <p className="text-gray-500">קוד מוצר: {product.code}</p>
        {product.manufacturer && (
          <p className="text-gray-500">יצרן: {product.manufacturer}</p>
        )}
      </div>

      <ProductImages productCode={product.code} />
      
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">השוואת מחירים</h3>
        {prices.length > 0 ? (
          <div className="border rounded-lg p-4 bg-gray-50">
            <PriceComparison prices={prices} />
          </div>
        ) : (
          <p className="text-gray-500">לא נמצאו מחירים למוצר זה</p>
        )}
      </div>
    </div>
  );
};
