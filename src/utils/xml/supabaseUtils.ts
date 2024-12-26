import { supabase } from '@/lib/supabase';

export const uploadProductsToSupabase = async (xmlUrl: string) => {
  console.log('Calling Edge Function with URL:', xmlUrl);
  
  const { data, error } = await supabase.functions.invoke('fetch-xml-prices', {
    body: { driveUrl: xmlUrl }
  });

  if (error) {
    console.error('Edge Function error:', error);
    throw error;
  }

  console.log('Edge Function response:', data);
  return data.count;
};