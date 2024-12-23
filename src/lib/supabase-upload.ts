import { supabase } from './supabase';
import { toast } from 'sonner';

export const uploadReceiptToSupabase = async (file: Blob) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const fileExt = 'jpg';
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

    console.log('Receipt record created, processing with OCR...');
    
    // Convert file to base64
    const reader = new FileReader();
    const base64Promise = new Promise((resolve) => {
      reader.onload = () => {
        const base64 = reader.result?.toString().split(',')[1];
        resolve(base64);
      };
    });
    reader.readAsDataURL(file);
    const base64Image = await base64Promise;

    // Call the Edge Function with proper JSON data
    const { data: processResult, error: processError } = await supabase.functions
      .invoke('process-receipt', {
        body: JSON.stringify({
          base64Image,
          receiptId: receipt.id,
          contentType: file.type
        })
      });

    if (processError) {
      console.error('Error processing receipt:', processError);
      toast.error('שגיאה בעיבוד הקבלה');
      return { publicUrl, receiptId: receipt.id };
    }

    console.log('OCR processing result:', processResult);
    if (processResult.items?.length > 0) {
      toast.success(`זוהו ${processResult.items.length} פריטים בקבלה`);
    }

    return { publicUrl, receiptId: receipt.id };
  } catch (error) {
    console.error('Error uploading receipt:', error);
    toast.error('שגיאה בהעלאת הקבלה');
    throw error;
  }
};