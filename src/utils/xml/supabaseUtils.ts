import { supabase } from '@/lib/supabase';

export const uploadProductsToSupabase = async (products: any[]) => {
  console.log('Starting batch upload of products...');
  
  for (let i = 0; i < products.length; i += 100) {
    const batch = products.slice(i, i + 100);
    const { error } = await supabase
      .from('store_products')
      .upsert(batch, { 
        onConflict: 'product_code,store_chain',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error uploading batch:', error);
      throw new Error(`שגיאה בהעלאת קבוצת מוצרים ${i/100 + 1}: ${error.message}`);
    }
    
    console.log(`Uploaded batch ${i/100 + 1} of ${Math.ceil(products.length/100)}`);
  }

  return products.length;
};