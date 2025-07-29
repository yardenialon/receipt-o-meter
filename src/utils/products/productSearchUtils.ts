
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/products';
import { toast } from 'sonner';
import { searchProductsByName, searchProductsByWords } from '@/utils/shopping/productSearchUtils';

// Helper function to safely parse date strings
export const safeParseDate = (dateStr: string | null | undefined): Date => {
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

// Search products with term
export const searchProducts = async (searchTerm: string, currentPage: number, productsPerPage: number) => {
  console.log(`מחפש מוצרים לפי ביטוי: "${searchTerm}"`);
  
  // שימוש במנגנון החיפוש המשופר מהשופינג ליסט
  let storeProductsData;
  
  // חיפוש לפי שם מוצר
  const productsByName = await searchProductsByName(searchTerm);
  
  if (productsByName.length > 0) {
    storeProductsData = productsByName;
    console.log(`נמצאו ${storeProductsData.length} מוצרים לחיפוש "${searchTerm}"`);
  } else {
    // אם לא נמצאו תוצאות, ננסה לחפש לפי מילים
    console.log(`לא נמצאו תוצאות ל-"${searchTerm}", מנסה חיפוש לפי מילים`);
    const productsByWords = await searchProductsByWords(searchTerm);
    storeProductsData = productsByWords;
    console.log(`נמצאו ${storeProductsData.length} מוצרים בחיפוש לפי מילים`);
  }
  
  const totalProducts = storeProductsData.length;
  
  // Get paginated slice of results
  const pageStart = (currentPage - 1) * productsPerPage;
  const pageEnd = pageStart + productsPerPage;
  const paginatedResults = storeProductsData.slice(pageStart, pageEnd);
  
  return { paginatedResults, totalProducts };
};

// Fetch products without search term
export const fetchAllProducts = async (currentPage: number, productsPerPage: number) => {
  // Get total count
  const { data: countData } = await supabase
    .from('store_products')
    .select('product_code');
  
  const totalProducts = countData ? countData.length : 0;
  
  // Get paginated results
  const { data: storeProductsData, error: storeProductsError } = await supabase
    .from('store_products')
    .select('*')
    .range((currentPage - 1) * productsPerPage, currentPage * productsPerPage - 1)
    .order('product_name', { ascending: true });
  
  if (storeProductsError) {
    console.error('שגיאה במשיכת מוצרים מ-store_products:', storeProductsError);
    toast.error('שגיאה בטעינת המוצרים');
    return { paginatedResults: [], totalProducts: 0 };
  }
  
  console.log(`נמצאו ${storeProductsData?.length || 0} מוצרים בטבלת store_products בעמוד ${currentPage}`);
  
  return { paginatedResults: storeProductsData || [], totalProducts };
};

// Fallback to products table if no store_products results
export const fetchProductsFromProductsTable = async (searchTerm: string, currentPage: number, productsPerPage: number) => {
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
    return { paginatedResults: [], totalProducts: 0 };
  }
  
  console.log(`נמצאו ${productsData?.length || 0} מוצרים בטבלת products`);
  
  // Get total count for products table
  const { data: countData } = await supabase
    .from('products')
    .select('id');
  
  const totalProducts = countData ? countData.length : 0;
  
  // סינון מוצרים ללא שם
  const validProducts = (productsData || []).filter(product => 
    product.name && product.name.trim() !== ''
  );
  
  return { paginatedResults: validProducts, totalProducts };
};
