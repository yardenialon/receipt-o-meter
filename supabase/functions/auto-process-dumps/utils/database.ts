import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export const createSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(supabaseUrl, supabaseKey);
};

export const processItems = async (supabase: any, items: any[], storeInfo: { networkName: string, branchName: string, storeAddress: string }) => {
  const batchSize = 500;
  let processedCount = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const products = batch.map(item => ({
      store_chain: storeInfo.networkName,
      store_id: storeInfo.branchName,
      store_address: storeInfo.storeAddress,
      product_code: item.ItemCode?._text,
      product_name: item.ItemName?._text,
      manufacturer: item.ManufacturerName?._text,
      price: parseFloat(item.ItemPrice?._text || '0'),
      unit_quantity: item.UnitQty?._text,
      unit_of_measure: item.UnitOfMeasure?._text,
      item_type: item.ItemType?._text,
      manufacture_country: item.ManufactureCountry?._text,
      manufacturer_item_description: item.ManufacturerItemDescription?._text,
      quantity: parseFloat(item.Quantity?._text || '0'),
      is_weighted: item.bIsWeighted?._text === 'true',
      qty_in_package: parseFloat(item.QtyInPackage?._text || '0'),
      unit_of_measure_price: parseFloat(item.UnitOfMeasurePrice?._text || '0'),
      allow_discount: item.AllowDiscount?._text === 'true',
      item_status: item.ItemStatus?._text,
      price_update_date: new Date().toISOString()
    }));

    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}`);
    
    const { error: insertError } = await supabase
      .from('store_products')
      .upsert(products, { 
        onConflict: 'product_code,store_chain',
        ignoreDuplicates: false 
      });

    if (insertError) {
      console.error('Error inserting products:', insertError);
      throw new Error('Error saving products: ' + insertError.message);
    }

    processedCount += products.length;
  }

  return processedCount;
};