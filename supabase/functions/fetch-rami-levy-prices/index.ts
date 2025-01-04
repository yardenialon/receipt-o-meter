import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
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
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://www.rami-levy.co.il',
        'Referer': 'https://www.rami-levy.co.il/he/shop',
        'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
      },
      body: JSON.stringify({
        store_id: store_id,
        branch_id: branch_id,
      }),
    })

    console.log('Got response from Rami Levy API:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error response from Rami Levy:', errorText)
      throw new Error(`Failed to fetch prices: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`Fetched ${data.length || 0} products from API`)

    if (!data || !Array.isArray(data)) {
      console.error('Invalid data format received:', data)
      throw new Error('Invalid data format received from API')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    console.log('Initializing Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseKey)

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

    // Insert in batches to avoid timeout
    const batchSize = 100
    let successCount = 0

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, Math.min(i + batchSize, products.length))
      console.log(`Inserting batch ${i / batchSize + 1} of ${Math.ceil(products.length / batchSize)}`)
      
      const { error: insertError } = await supabase
        .from('store_products_import')
        .upsert(batch)

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError)
      } else {
        successCount += batch.length
        console.log(`Successfully inserted batch ${i / batchSize + 1}`)
      }
    }

    console.log(`Operation completed. Inserted ${successCount} out of ${products.length} products`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Imported ${successCount} products`,
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