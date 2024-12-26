import { supabase } from '@/lib/supabase';

export const uploadProductsToSupabase = async (xmlContent: string) => {
  console.log('Processing XML content directly...');
  
  const { data, error } = await supabase.functions.invoke('fetch-xml-prices', {
    body: { xmlContent }
  });

  if (error) {
    console.error('Edge Function error:', error);
    throw error;
  }

  console.log('Edge Function response:', data);
  return data.count;
};