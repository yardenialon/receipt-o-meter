
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export const findProductByBarcode = async (barcode: string) => {
  console.log('Searching for product with barcode:', barcode);
  
  try {
    const { data, error } = await supabase
      .from('store_products')
      .select('*')
      .eq('product_code', barcode)
      .limit(1);

    if (error) {
      console.error('Error searching for product:', error);
      throw error;
    }

    if (data && data.length > 0) {
      console.log('Product found:', data[0]);
      return data[0];
    }
    
    console.log('No product found with barcode:', barcode);
    return null;
  } catch (error) {
    console.error('Error in findProductByBarcode:', error);
    toast.error('שגיאה בחיפוש המוצר');
    return null;
  }
};

export const detectBarcodeWithNative = async (video: HTMLVideoElement): Promise<string | null> => {
  try {
    if ('BarcodeDetector' in window) {
      console.log('Using native BarcodeDetector');
      const barcodeDetector = new (window as any).BarcodeDetector();
      const barcodes = await barcodeDetector.detect(video);
      
      if (barcodes.length > 0) {
        console.log('Barcode detected:', barcodes[0].rawValue);
        return barcodes[0].rawValue;
      }
    }
    return null;
  } catch (error) {
    console.error('Error using native BarcodeDetector:', error);
    return null;
  }
};

export const detectBarcodeWithVision = async (imageBlob: Blob): Promise<string | null> => {
  try {
    console.log('Using Vision API for barcode detection');
    const formData = new FormData();
    formData.append('image', imageBlob);
    
    const response = await fetch('https://kthqkydgegsoheymesgc.supabase.co/functions/v1/detect-barcode', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to detect barcode');
    }

    const result = await response.json();
    if (result.barcode) {
      console.log('Barcode detected by Vision API:', result.barcode);
      return result.barcode;
    }
    return null;
  } catch (error) {
    console.error('Error detecting barcode with Vision:', error);
    return null;
  }
};
