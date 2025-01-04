import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting to fetch Rami Levy prices...')
    
    const { store_id = '001', branch_id = '089' } = await req.json()
    console.log(`Fetching prices for store ${store_id}, branch ${branch_id}`)

    const response = await fetch(`https://www.rami-levy.co.il/api/catalog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        store_id: store_id,
        branch_id: branch_id,
      }),
    })

    console.log('Got response from Rami Levy API')

    if (!response.ok) {
      console.error('Error from Rami Levy API:', response.status, response.statusText)
      throw new Error(`Failed to fetch prices: ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`Fetched ${data.length || 0} products from API`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log('Supabase client initialized')

    // Transform and insert data
    const products = data.map((item: any) => ({
      store_chain: 'רמי לוי',
      store_id: store_id,
      store_address: `סניף ${branch_id}`,
      ItemCode: item.code,
      ItemType: item.type,
      ItemName: item.name,
      ManufacturerName: item.manufacturer,
      ItemPrice: item.price,
      PriceUpdateDate: new Date().toISOString(),
      UnitQty: item.unit,
      Quantity: item.quantity || 1,
      UnitOfMeasure: item.measureUnit,
    }))

    console.log(`Prepared ${products.length} products for insertion`)

    const { error: insertError } = await supabase
      .from('store_products_import')
      .upsert(products)

    if (insertError) {
      console.error('Error inserting products:', insertError)
      throw new Error(`Failed to insert products: ${insertError.message}`)
    }

    console.log('Successfully inserted products')

    return new Response(
      JSON.stringify({
        success: true,
        message: `Imported ${products.length} products`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error in fetch-rami-levy-prices:', error)
    
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