
import { supabase } from "@/lib/supabase";

export const findProductByBarcode = async (barcode: string) => {
  try {
    const { data, error } = await supabase
      .from('store_products')
      .select('*')
      .eq('product_code', barcode)
      .limit(1);

    if (error) {
      console.error('Error finding product by barcode:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in findProductByBarcode:', error);
    return null;
  }
};

export const detectBarcodeWithNative = async (videoElement: HTMLVideoElement) => {
  try {
    if (!('BarcodeDetector' in window)) {
      console.log('Barcode Detection API not supported');
      return null;
    }

    // @ts-ignore: BarcodeDetector might not be recognized by TypeScript
    const barcodeDetector = new BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'code_93', 'upc_a', 'upc_e']
    });

    const barcodes = await barcodeDetector.detect(videoElement);
    
    if (barcodes && barcodes.length > 0) {
      console.log('Barcodes detected with native API:', barcodes);
      return barcodes[0].rawValue;
    }
    
    return null;
  } catch (error) {
    console.error('Error detecting barcode with native API:', error);
    return null;
  }
};

export const detectBarcodeWithVision = async (imageBlob: Blob) => {
  try {
    const formData = new FormData();
    formData.append('image', imageBlob);

    const response = await fetch('/api/detect-barcode', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to call barcode detection API');
    }

    const data = await response.json();
    return data.barcode || null;
  } catch (error) {
    console.error('Error detecting barcode with Vision API:', error);
    return null;
  }
};

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
