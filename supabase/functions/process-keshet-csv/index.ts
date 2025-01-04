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

    // Process records in smaller batches to avoid memory issues
    const batchSize = 1000
    let processedCount = 0
    let errorCount = 0
    const errors = []

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, Math.min(i + batchSize, records.length))
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`)

      try {
        const { error } = await supabase
          .from('keshet_products_import')
          .insert(batch)

        if (error) {
          console.error('Error inserting batch:', error)
          errorCount++
          errors.push({
            batch: Math.floor(i / batchSize) + 1,
            error: error.message
          })
        } else {
          processedCount += batch.length
        }
      } catch (error) {
        console.error('Error processing batch:', error)
        errorCount++
        errors.push({
          batch: Math.floor(i / batchSize) + 1,
          error: error.message
        })
      }
    }

    console.log('Finished processing all batches')
    console.log(`Successfully processed ${processedCount} records`)
    if (errorCount > 0) {
      console.log(`Encountered ${errorCount} errors during processing`)
    }

    // Process the imported records using the database function
    if (processedCount > 0) {
      const { error: processError } = await supabase
        .rpc('process_keshet_products')

      if (processError) {
        console.error('Error processing records:', processError)
        throw processError
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${processedCount} products`,
        errors: errors.length > 0 ? errors : undefined
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
        error: error.message,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})