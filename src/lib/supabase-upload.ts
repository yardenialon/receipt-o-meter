import { supabase } from './supabase';
import { toast } from 'sonner';

export const uploadReceiptToSupabase = async (file: Blob) => {
  try {
    const fileExt = 'jpg';
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('receipts')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('receipts')
      .insert([
        {
          image_url: publicUrl,
          store_name: 'חנות חדשה', // Default name, can be updated later
          total: 0, // Default total, can be updated later
        }
      ]);

    if (dbError) {
      throw dbError;
    }

    toast.success('הקבלה נשמרה בהצלחה!');
    return { publicUrl };
  } catch (error) {
    console.error('Error uploading receipt:', error);
    toast.error('שגיאה בהעלאת הקבלה');
    throw error;
  }
};