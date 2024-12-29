import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsStats } from '@/components/products/ProductsStats';
import { ProductsSearch } from '@/components/products/ProductsSearch';
import { ProductsTable } from '@/components/products/ProductsTable';
import { PriceFileUpload } from '@/components/products/PriceFileUpload';

interface ProductPrices {
  [key: string]: {
    expanded: boolean;
  }
}

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<ProductPrices>({});
  
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .order('category')
        .order('price_update_date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Calculate statistics
  const totalProducts = products?.length || 0;
  const storeChains = [...new Set(products?.map(p => p.store_chain) || [])];
  const totalStoreChains = storeChains.length;

  // Filter products based on search term
  const filteredProducts = products?.filter(product => 
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    product.product_code.toString().includes(searchTerm)
  );

  // Group products by product code
  const groupedProducts = filteredProducts?.reduce((acc, product) => {
    if (!acc[product.product_code]) {
      acc[product.product_code] = [];
    }
    acc[product.product_code].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  const toggleProductExpansion = (productCode: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productCode]: { expanded: !prev[productCode]?.expanded }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        שגיאה בטעינת המוצרים
      </div>
    );
  }

  // Group products by category
  const productsByCategory = groupedProducts ? Object.entries(groupedProducts).reduce((acc, [productCode, products]) => {
    const category = products[0].category || 'אחר';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ productCode, products });
    return acc;
  }, {} as Record<string, Array<{ productCode: string, products: typeof products }>>) : {};

  return (
    <div className="container mx-auto py-8">
      <ProductsHeader />

      <ProductsStats
        totalProducts={totalProducts}
        totalStoreChains={totalStoreChains}
        storeChains={storeChains}
      />

      <ProductsSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="my-8">
        <PriceFileUpload />
      </div>
      
      <ProductsTable
        productsByCategory={productsByCategory}
        expandedProducts={expandedProducts}
        onToggleExpand={toggleProductExpansion}
      />
    </div>
  );
};

export default Products;