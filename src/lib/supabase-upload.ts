import { supabase } from './supabase';
import { toast } from 'sonner';

export const uploadReceiptToSupabase = async (file: Blob) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const fileExt = file.type === 'application/pdf' ? 'pdf' : 'jpg';
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log('Uploading file to storage...');
    const { error: uploadError, data } = await supabase.storage
      .from('receipts')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    console.log('File uploaded, creating receipt record...');
    // Insert the receipt and get the ID
    const { data: receipt, error: dbError } = await supabase
      .from('receipts')
      .insert({
        image_url: publicUrl,
        store_name: 'מעבד...',
        total: 0,
        user_id: user.id
      })
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    return { publicUrl, receiptId: receipt.id };
  } catch (error) {
    console.error('Error uploading receipt:', error);
    toast.error('שגיאה בהעלאת הקבלה');
    throw error;
  }
};