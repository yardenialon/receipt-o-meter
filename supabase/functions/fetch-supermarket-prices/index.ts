import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PriceData {
  chainId: string
  chainName: string
  storeId: string
  storeName: string
  itemCode: string
  itemName: string
  itemPrice: number
  itemType?: string
  manufacturerName?: string
  manufacturerCountry?: string
  unitQty?: string
  quantity?: number
  unitOfMeasure?: string
  priceUpdateDate: string
  storeAddress?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Create a new price update record
    const { data: updateRecord, error: updateError } = await supabase
      .from('price_updates')
      .insert({
        status: 'processing',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Fetch prices from the API
    console.log('Fetching prices from API...')
    const response = await fetch('https://api.supermarket-prices.co.il/prices')
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const prices: PriceData[] = await response.json()
    console.log(`Fetched ${prices.length} prices from API`)

    // Transform and insert the data in batches
    const batchSize = 1000
    let processedCount = 0
    let errorCount = 0
    const errors: any[] = []

    for (let i = 0; i < prices.length; i += batchSize) {
      const batch = prices.slice(i, Math.min(i + batchSize, prices.length))
      
      const { error: insertError } = await supabase
        .from('store_products_import')
        .upsert(batch.map(price => ({
          store_chain: price.chainName,
          store_id: price.storeId,
          store_address: price.storeAddress,
          ItemCode: price.itemCode,
          ItemName: price.itemName,
          ItemPrice: price.itemPrice,
          ItemType: price.itemType,
          ManufacturerName: price.manufacturerName,
          ManufactureCountry: price.manufacturerCountry,
          UnitQty: price.unitQty,
          Quantity: price.quantity,
          UnitOfMeasure: price.unitOfMeasure,
          PriceUpdateDate: price.priceUpdateDate || new Date().toISOString(),
        })))

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize}:`, insertError)
        errorCount++
        errors.push(insertError)
      }

      processedCount += batch.length
      
      // Update progress
      await supabase
        .from('price_updates')
        .update({
          processed_products: processedCount,
          total_products: prices.length,
          error_log: errors.length ? { errors } : null,
        })
        .eq('id', updateRecord.id)
    }

    // Update final status
    await supabase
      .from('price_updates')
      .update({
        status: errorCount > 0 ? 'completed_with_errors' : 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', updateRecord.id)

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        errors: errorCount,
        updateId: updateRecord.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})