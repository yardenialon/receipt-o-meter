import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function updateReceiptStatus(
  receiptId: string, 
  status: { store_name: string; total: number }
) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('receipts')
    .update(status)
    .eq('id', receiptId);

  if (error) {
    console.error('Error updating receipt status:', error);
    throw error;
  }
}

export async function insertReceiptItems(
  receiptId: string, 
  items: Array<{ name: string; price: number }>
) {
  if (items.length === 0) return;

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('receipt_items')
    .insert(items.map(item => ({
      receipt_id: receiptId,
      name: item.name,
      price: item.price,
      quantity: 1
    })));

  if (error) {
    console.error('Error inserting items:', error);
    throw error;
  }
}