import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

function getSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

export async function updateReceiptStatus(
  receiptId: string,
  status: { store_name: string; total: number }
) {
  console.log('Updating receipt status:', { receiptId, status });
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('receipts')
    .update(status)
    .eq('id', receiptId);

  if (error) {
    console.error('Error updating receipt:', error);
    throw error;
  }
}

export async function insertReceiptItems(
  receiptId: string,
  items: Array<{ name: string; price: number }>
) {
  if (!items || items.length === 0) return;

  console.log('Inserting receipt items:', { receiptId, itemCount: items.length });
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('receipt_items')
    .insert(
      items.map(item => ({
        receipt_id: receiptId,
        name: item.name,
        price: item.price,
        quantity: 1
      }))
    );

  if (error) {
    console.error('Error inserting items:', error);
    throw error;
  }
}