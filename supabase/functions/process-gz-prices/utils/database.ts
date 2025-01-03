import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export const createSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('תצורת השרת חסרה');
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
      ItemCode: item.ItemCode?._text,
      ItemType: item.ItemType?._text,
      ItemName: item.ItemName?._text,
      ManufacturerName: item.ManufacturerName?._text,
      ManufactureCountry: item.ManufactureCountry?._text,
      ManufacturerItemDescription: item.ManufacturerItemDescription?._text,
      UnitQty: item.UnitQty?._text,
      Quantity: parseFloat(item.Quantity?._text || '0'),
      bIsWeighted: item.bIsWeighted?._text === 'true',
      UnitOfMeasure: item.UnitOfMeasure?._text,
      QtyInPackage: parseFloat(item.QtyInPackage?._text || '0'),
      ItemPrice: parseFloat(item.ItemPrice?._text || '0'),
      UnitOfMeasurePrice: parseFloat(item.UnitOfMeasurePrice?._text || '0'),
      AllowDiscount: item.AllowDiscount?._text === 'true',
      ItemStatus: item.ItemStatus?._text,
      PriceUpdateDate: new Date().toISOString()
    }));

    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}`);
    
    const { error: insertError } = await supabase
      .from('store_products_import')
      .insert(products);

    if (insertError) {
      console.error('Error inserting products:', insertError);
      throw new Error('שגיאה בשמירת המוצרים: ' + insertError.message);
    }

    processedCount += products.length;
  }

  return processedCount;
};