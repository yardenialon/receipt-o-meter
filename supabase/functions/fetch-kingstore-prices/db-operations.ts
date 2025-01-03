import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function insertProducts(products: any[]) {
  if (products.length === 0) return 0;

  try {
    const { error } = await supabase
      .from('store_products_import')
      .insert(products);

    if (error) {
      console.error('Error inserting products:', error);
      throw error;
    }

    return products.length;
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
}