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
    console.log('Starting price fetch operation...')
    
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
      console.error('Error creating price update record:', updateError)
      throw updateError
    }

    console.log('Created price update record:', updateRecord)

    // Fetch prices from the API with proper headers and timeout
    console.log('Fetching prices from API...')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

    try {
      const response = await fetch('https://api.supermarket-prices.co.il/prices', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        console.error('API Response not OK:', {
          status: response.status,
          statusText: response.statusText,
        })
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
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
        const { error: progressError } = await supabase
          .from('price_updates')
          .update({
            processed_products: processedCount,
            total_products: prices.length,
            error_log: errors.length ? { errors } : null,
          })
          .eq('id', updateRecord.id)

        if (progressError) {
          console.error('Error updating progress:', progressError)
        }
      }

      // Update final status
      const { error: finalUpdateError } = await supabase
        .from('price_updates')
        .update({
          status: errorCount > 0 ? 'completed_with_errors' : 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', updateRecord.id)

      if (finalUpdateError) {
        console.error('Error updating final status:', finalUpdateError)
      }

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

    } catch (fetchError) {
      console.error('Fetch operation failed:', fetchError)
      
      // Update the price update record with the error
      const { error: errorUpdateError } = await supabase
        .from('price_updates')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_log: { error: fetchError.message },
        })
        .eq('id', updateRecord.id)

      if (errorUpdateError) {
        console.error('Error updating error status:', errorUpdateError)
      }

      throw fetchError
    }

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