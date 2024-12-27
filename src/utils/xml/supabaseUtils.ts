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
    throw new Error('לא התקבלו נתונים מהשרת');
  }

  console.log('Edge Function response:', data);
  return data;
};