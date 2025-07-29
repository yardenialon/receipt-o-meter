
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Product } from '@/types/products';
import { 
  searchProducts,
  fetchAllProducts,
  fetchProductsFromProductsTable
} from '@/utils/products/productSearchUtils';
import { 
  processStoreProducts,
  processProductsTable,
  getProductsByCategory,
  getFlattenedProducts
} from '@/utils/products/productProcessingUtils';

interface UseProductsDataProps {
  currentPage: number;
  searchTerm: string;
  productsPerPage?: number;
}

export const useProductsData = ({ currentPage, searchTerm, productsPerPage = 50 }: UseProductsDataProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, productsPerPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('פותח חיבור ל-Supabase ומושך מוצרים מטבלת store_products');
      
      if (searchTerm) {
        // Search with term
        const { paginatedResults, totalProducts: total } = 
          await searchProducts(searchTerm, currentPage, productsPerPage);
        
        setTotalProducts(total);
        
        // Process the results into the format expected by our components
        if (paginatedResults.length > 0) {
          const processedProducts = processStoreProducts(paginatedResults);
          setProducts(processedProducts);
          setLoading(false);
          return;
        }
      } else {
        // Fetch all products without search term
        const { paginatedResults, totalProducts: total } = 
          await fetchAllProducts(currentPage, productsPerPage);
        
        setTotalProducts(total);
        
        // If there are products in store_products, use them
        if (paginatedResults && paginatedResults.length > 0) {
          const processedProducts = processStoreProducts(paginatedResults);
          setProducts(processedProducts);
          setLoading(false);
          return;
        }
      }
      
      // If we got here, try fetching from products table as backup
      const { paginatedResults, totalProducts: total } = 
        await fetchProductsFromProductsTable(searchTerm, currentPage, productsPerPage);
      
      setTotalProducts(total);
      
      const processedProductsData = processProductsTable(paginatedResults);
      setProducts(processedProductsData);
      
    } catch (error) {
      console.error('שגיאה כללית בטעינת המוצרים:', error);
      toast.error('שגיאה בטעינת המוצרים');
    } finally {
      setLoading(false);
    }
  };

  const productsByCategory = getProductsByCategory(products);
  const flattenedProducts = getFlattenedProducts(productsByCategory);

  return {
    products,
    loading,
    totalProducts,
    productsByCategory,
    flattenedProducts,
    fetchProducts
  };
};
