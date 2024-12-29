import { supabase } from '@/lib/supabase';

export const uploadProductsToSupabase = async (xmlContent: string, networkName: string, branchName: string) => {
  console.log('Processing XML content...');
  
  const { data, error } = await supabase.functions.invoke('fetch-xml-prices', {
    body: { 
      xmlContent,
      networkName,
      branchName
    }
  });

  if (error) {
    console.error('Edge Function error:', error);
    throw new Error(error.message || 'שגיאה בעיבוד הקובץ');
  }

  if (!data) {
    console.error('No data received from server');
    throw new Error('לא התקבלו נתונים מהשרת');
  }

  if (!data.success) {
    console.error('Upload failed:', data.error);
    throw new Error(data.error || 'שגיאה בהעלאת המוצרים');
  }

  console.log('Upload response:', data);
  return data;
};