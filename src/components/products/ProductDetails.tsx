import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ProductImages } from './ProductImages';

interface Product {
  id: string;
  code: string;
  name: string;
  // other product fields
}

export const ProductDetails = () => {
  const { productCode } = useParams<{ productCode: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productCode) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('code', productCode)
          .single();

        if (error) {
          console.error('Error fetching product:', error);
          return;
        }

        setProduct(data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productCode]);

  if (loading) {
    return <div className="p-8 text-center">טוען פרטי מוצר...</div>;
  }

  if (!product) {
    return <div className="p-8 text-center">לא נמצא מוצר עם הקוד {productCode}</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold">{product.name}</h2>
        <p className="text-gray-500">קוד מוצר: {product.code}</p>
      </div>

      <ProductImages productCode={product.code} />

      {/* Other product details */}
      {/* ... */}
    </div>
  );
};
