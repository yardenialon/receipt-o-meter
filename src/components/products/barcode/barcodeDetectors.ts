
import { supabase } from "@/lib/supabase";

export const detectBarcodeFromAPI = async (barcode: string) => {
  try {
    // Check if the barcode exists in our database
    const { data: products, error } = await supabase
      .from('store_products')
      .select('*')
      .eq('product_code', barcode)
      .limit(1);

    if (error) {
      throw error;
    }

    if (products && products.length > 0) {
      return {
        success: true,
        data: products[0],
        source: 'database'
      };
    }

    // If not found in our database, we can try to fetch from external API
    const response = await fetch('/api/detect-barcode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ barcode }),
    });

    if (!response.ok) {
      throw new Error('Failed to detect barcode from API');
    }

    const result = await response.json();
    
    return {
      success: true,
      data: result,
      source: 'api'
    };
  } catch (error) {
    console.error('Error detecting barcode:', error);
    return {
      success: false,
      error: 'Failed to detect barcode'
    };
  }
};
