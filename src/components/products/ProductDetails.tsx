import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ProductImages } from './ProductImages';

interface Product {
  id: string;
  code: string;
  name: string;
  // other product fields
}

interface ProductDetailsProps {
  productCode: string;
}

export const ProductDetails = ({ productCode }: ProductDetailsProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
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

    if (productCode) {
      fetchProduct();
    }
  }, [productCode]);

  if (loading) {
    return <div>טוען פרטי מוצר...</div>;
  }

  if (!product) {
    return <div>לא נמצא מוצר עם הקוד {productCode}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">{product.name}</h2>
        <p className="text-gray-500">קוד מוצר: {product.code}</p>
      </div>

      {/* Add the ProductImages component */}
      <ProductImages productCode={product.code} />

      {/* Other product details */}
      {/* ... */}
    </div>
  );
};
