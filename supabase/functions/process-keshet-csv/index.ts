import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { parse } from 'https://deno.land/std@0.181.0/encoding/csv.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting CSV processing...')
    
    // Get the FormData from the request
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded')
    }

    console.log('Processing file:', file.name)

    // Read the file content
    const fileContent = await file.text()
    
    // Parse CSV
    const records = parse(fileContent, {
      skipFirstRow: true,
      columns: [
        'ChainId', 'SubChainId', 'StoreId', 'BikoretNo', 'PriceUpdateDate',
        'ItemCode', 'ItemType', 'ItemName', 'ManufacturerName', 'ManufactureCountry',
        'ManufacturerItemDescription', 'UnitQty', 'Quantity', 'UnitOfMeasure',
        'bIsWeighted', 'QtyInPackage', 'ItemPrice', 'UnitOfMeasurePrice',
        'AllowDiscount', 'ItemStatus', 'ItemId'
      ]
    })

    console.log(`Parsed ${records.length} records from CSV`)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Insert records into keshet_products_import table
    const { error } = await supabase
      .from('keshet_products_import')
      .insert(records)

    if (error) {
      console.error('Error inserting records:', error)
      throw error
    }

    // Process the imported records
    const { error: processError } = await supabase
      .rpc('process_keshet_products')

    if (processError) {
      console.error('Error processing records:', processError)
      throw processError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${records.length} products` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})