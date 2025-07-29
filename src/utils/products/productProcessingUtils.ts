
import { Product } from '@/types/products';
import { safeParseDate } from './productSearchUtils';

// Process store products into standard format
export const processStoreProducts = (storeProductsData: any[]) => {
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
  const processedProducts: Product[] = Object.values(productsByCode).map(productsGroup => {
    const baseProduct = productsGroup[0];
    return {
      id: baseProduct.product_code,
      code: baseProduct.product_code,
      name: baseProduct.product_name,
      manufacturer: baseProduct.manufacturer || '',
      productDetails: Array.isArray(productsGroup) ? productsGroup : []
    };
  });
  
  console.log(`עיבוד ${processedProducts.length} מוצרים ייחודיים לתצוגה`);
  return processedProducts;
};

// Process products data from products table
export const processProductsTable = (productsData: any[]) => {
  // Process the products data to ensure valid dates
  const processedProductsData: Product[] = productsData.map(product => ({
    ...product,
    updated_at: product.updated_at ? safeParseDate(product.updated_at).toISOString() : new Date().toISOString(),
    created_at: product.created_at ? safeParseDate(product.created_at).toISOString() : new Date().toISOString(),
    productDetails: [] // Initialize as empty array to match Product type
  }));
  
  return processedProductsData;
};

// Helper to process products by category
export const getProductsByCategory = (products: Product[]) => {
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
export const getFlattenedProducts = (productsByCategory: Record<string, Array<{ productCode: string, products: any[] }>>) => {
  return Object.values(productsByCategory).flat();
};
