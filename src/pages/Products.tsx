
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsTable } from '@/components/products/ProductsTable';
import { supabase } from '@/lib/supabase';

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
  // Remove the price property as it's not returned from the products table
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

  const handleToggleExpand = (productCode: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productCode]: { expanded: !prev[productCode]?.expanded }
    }));
  };

  // Create a data structure compatible with the ProductsTable component
  const productsByCategory: Record<string, Array<{ productCode: string, products: any[] }>> = {};
  
  // Group products by category for the ProductsTable
  products.forEach(product => {
    const category = product.category_id || 'General';
    if (!productsByCategory[category]) {
      productsByCategory[category] = [];
    }
    
    // Adapt to the structure required by ProductsTable
    productsByCategory[category].push({
      productCode: product.code,
      products: [{
        product_code: product.code,
        product_name: product.name,
        manufacturer: product.manufacturer || '',
        price: 0, // Default price since we don't have actual pricing data here
        price_update_date: product.updated_at || new Date().toISOString()
      }]
    });
  });

  return (
    <div className="p-6 space-y-6">
      <ProductsHeader />
      
      <ProductsTable 
        productsByCategory={productsByCategory} 
        expandedProducts={expandedProducts}
        onToggleExpand={handleToggleExpand}
      />
    </div>
  );
};

export default Products;
