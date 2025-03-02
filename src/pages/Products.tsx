
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsTable } from '@/components/products/ProductsTable';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  // Add other fields as needed
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (productCode: string) => {
    navigate(`/products/${productCode}`);
  };

  return (
    <div className="p-6 space-y-6">
      <ProductsHeader />
      
      <ProductsTable 
        products={products} 
        loading={loading} 
        onRowClick={handleRowClick} 
      />
    </div>
  );
};

export default Products;
