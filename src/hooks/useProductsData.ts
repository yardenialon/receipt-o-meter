
import { useState, useEffect } from 'react';
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
  productDetails?: any[]; 
}

interface UseProductsDataProps {
  currentPage: number;
  searchTerm: string;
  productsPerPage?: number;
}

export const useProductsData = ({ currentPage, searchTerm, productsPerPage = 50 }: UseProductsDataProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Helper function to safely parse date strings
  const safeParseDate = (dateStr: string | null | undefined): Date => {
    if (!dateStr) return new Date();
    
    try {
      const date = new Date(dateStr);
      // Check if valid date
      if (isNaN(date.getTime())) {
        return new Date(); // Return current date if invalid
      }
      return date;
    } catch (error) {
      console.error('Invalid date format:', dateStr, error);
      return new Date(); // Return current date if parsing fails
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('פותח חיבור ל-Supabase ומושך מוצרים מטבלת store_products');
      
      // Build the query based on search term
      let query = supabase
        .from('store_products')
        .select('product_code, product_name, manufacturer, price, price_update_date, store_chain, store_id');
      
      // Apply search filter if needed
      if (searchTerm) {
        console.log(`מחפש מוצרים לפי ביטוי: "${searchTerm}"`);
        // Check if searchTerm is a product code (typically numeric)
        if (/^\d+$/.test(searchTerm)) {
          query = query.ilike('product_code', `%${searchTerm}%`);
        } else {
          // שיפור החיפוש בשם המוצר - ודא שהחיפוש מדויק יותר
          query = query.ilike('product_name', `%${searchTerm}%`);
        }
      }
      
      // Get total count
      let totalCount = 0;
      if (searchTerm) {
        const { count: searchCount, error: countError } = await query
          .select('product_code', { count: 'exact', head: true });
        if (countError) {
          console.error('שגיאה בספירת מוצרים:', countError);
        } else {
          totalCount = searchCount || 0;
        }
      } else {
        const { count: allCount, error: countError } = await supabase
          .from('store_products')
          .select('product_code', { count: 'exact', head: true });
        if (countError) {
          console.error('שגיאה בספירת מוצרים:', countError);
        } else {
          totalCount = allCount || 0;
        }
      }
      
      setTotalProducts(totalCount);
      console.log(`סך הכל ${totalCount} מוצרים`);
      
      // Get paginated results
      const { data: storeProductsData, error: storeProductsError } = await query
        .range((currentPage - 1) * productsPerPage, currentPage * productsPerPage - 1)
        .order('product_name', { ascending: true }); // מיון לפי שם מוצר - לשיפור איכות התוצאות
      
      if (storeProductsError) {
        console.error('שגיאה במשיכת מוצרים מ-store_products:', storeProductsError);
        toast.error('שגיאה בטעינת המוצרים');
        setLoading(false);
        return;
      }
      
      // If there are products in store_products, use them
      if (storeProductsData && storeProductsData.length > 0) {
        console.log(`נמצאו ${storeProductsData.length} מוצרים בטבלת store_products בעמוד ${currentPage}`);
        
        // Collect products by code
        const productsByCode = storeProductsData.reduce((acc, product) => {
          // ודא שיש שם מוצר תקין לפני הוספה
          if (!product.product_name || product.product_name.trim() === '') {
            console.warn(`מוצר ללא שם נמצא, קוד: ${product.product_code}`);
            return acc; // דלג על מוצרים ללא שם
          }
          
          const key = product.product_code;
          if (!acc[key]) {
            acc[key] = [];
          }
          
          // Ensure price_update_date is always valid
          const safeProduct = {
            ...product,
            price_update_date: product.price_update_date ? safeParseDate(product.price_update_date).toISOString() : new Date().toISOString()
          };
          
          acc[key].push(safeProduct);
          return acc;
        }, {} as Record<string, any[]>);
        
        // Convert to the required structure for Products component
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
      
      // If no products in store_products, try fetching from products table as backup
      console.log('מושך מוצרים מטבלת products כגיבוי');
      
      // Build the query based on search term for products table
      let productsQuery = supabase
        .from('products')
        .select('*');
      
      // Apply search filter if needed
      if (searchTerm) {
        // Check if searchTerm is a product code (typically numeric)
        if (/^\d+$/.test(searchTerm)) {
          productsQuery = productsQuery.ilike('code', `%${searchTerm}%`);
        } else {
          productsQuery = productsQuery.ilike('name', `%${searchTerm}%`);
        }
      }
      
      // Get paginated results
      const { data: productsData, error: productsError } = await productsQuery
        .range((currentPage - 1) * productsPerPage, currentPage * productsPerPage - 1)
        .order('name', { ascending: true });

      if (productsError) {
        console.error('שגיאה במשיכת מוצרים מ-products:', productsError);
        toast.error('שגיאה בטעינת המוצרים');
      } else {
        console.log(`נמצאו ${productsData?.length || 0} מוצרים בטבלת products`);
        
        // סינון מוצרים ללא שם
        const validProducts = (productsData || []).filter(product => 
          product.name && product.name.trim() !== ''
        );
        
        // Process the products data to ensure valid dates
        const processedProductsData = validProducts.map(product => ({
          ...product,
          updated_at: product.updated_at ? safeParseDate(product.updated_at).toISOString() : new Date().toISOString(),
          created_at: product.created_at ? safeParseDate(product.created_at).toISOString() : new Date().toISOString()
        }));
        
        setProducts(processedProductsData);
        
        // Number of products in products table
        const { count: productsCount, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error('שגיאה בספירת מוצרים:', countError);
        } else {
          setTotalProducts(productsCount || 0);
        }
      }
    } catch (error) {
      console.error('שגיאה כללית בטעינת המוצרים:', error);
      toast.error('שגיאה בטעינת המוצרים');
    } finally {
      setLoading(false);
    }
  };

  // Helper to process products by category
  const getProductsByCategory = () => {
    const productsByCategory: Record<string, Array<{ productCode: string, products: any[] }>> = {};
    
    products.forEach(product => {
      const category = product.category_id || 'כללי';
      if (!productsByCategory[category]) {
        productsByCategory[category] = [];
      }
      
      const productsArray = product.productDetails || [{
        product_code: product.code,
        product_name: product.name,
        manufacturer: product.manufacturer || '',
        price: 0,
        price_update_date: product.updated_at || new Date().toISOString()
      }];
      
      productsByCategory[category].push({
        productCode: product.code,
        products: productsArray
      });
    });
    
    return productsByCategory;
  };

  // Helper to get flattened products array
  const getFlattenedProducts = () => {
    const productsByCategory = getProductsByCategory();
    return Object.values(productsByCategory).flat();
  };

  return {
    products,
    loading,
    totalProducts,
    productsByCategory: getProductsByCategory(),
    flattenedProducts: getFlattenedProducts(),
    fetchProducts
  };
};
