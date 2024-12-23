import { supabase } from './supabase';
import { toast } from 'sonner';

export const uploadReceiptToSupabase = async (file: Blob) => {
  try {
    // Check if the receipts bucket exists, if not create it
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(bucket => bucket.name === 'receipts')) {
      const { error: bucketError } = await supabase.storage.createBucket('receipts', {
        public: true
      });
      if (bucketError) throw bucketError;
    }

    const fileName = `receipt-${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase
      .from('receipts')
      .insert([
        {
          file_name: fileName,
          url: publicUrl,
          status: 'pending',
          created_at: new Date().toISOString(),
        }
      ]);

    if (dbError) throw dbError;

    toast.success('הקבלה הועלתה בהצלחה!');
    return { fileName, publicUrl };
  } catch (error: any) {
    console.error('Upload error:', error);
    if (error.message?.includes('duplicate key')) {
      toast.error('קבלה זו כבר קיימת במערכת');
    } else if (error.message?.includes('bucket')) {
      toast.error('שגיאה בהגדרות האחסון. אנא פנה לתמיכה.');
    } else {
      toast.error('שגיאה בהעלאת הקבלה. אנא נסו שוב.');
    }
    throw error;
  }
};