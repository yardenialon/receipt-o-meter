import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { parse as xmlParse } from "https://deno.land/x/xml@2.1.1/mod.ts";

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
    const { xmlContent } = await req.json()
    
    if (!xmlContent) {
      throw new Error('לא התקבל תוכן XML')
    }

    console.log('Received XML content length:', xmlContent.length)
    
    // Basic XML validation
    if (!xmlContent.includes('<?xml')) {
      console.error('Content does not appear to be XML')
      throw new Error('התוכן אינו מתחיל בהצהרת XML תקינה')
    }

    // Check for common XML issues
    const missingClosingTags = (xmlContent.match(/<[^/][^>]*>/g) || []).length !==
      (xmlContent.match(/<\/[^>]*>/g) || []).length
    
    if (missingClosingTags) {
      console.error('XML has mismatched tags')
      throw new Error('קובץ ה-XML אינו תקין - יש תגיות שלא נסגרו כראוי')
    }

    // Parse XML with better error handling
    console.log('Parsing XML content...')
    let data
    try {
      data = xmlParse(xmlContent.trim())
    } catch (parseError) {
      console.error('XML Parse Error:', parseError)
      throw new Error('שגיאה בפרסור ה-XML: ' + 
        (parseError.message === 'UnexpectedEof' 
          ? 'הקובץ אינו שלם או חסרות תגיות סגירה' 
          : parseError.message))
    }

    const items = data.Items?.Item || []

    if (!items.length) {
      throw new Error('לא נמצאו פריטים ב-XML')
    }

    console.log(`Found ${items.length} items in the XML content`)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Process items in batches
    const batchSize = 100
    let processed = 0
    let successCount = 0

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize).map(item => ({
        store_chain: 'שופרסל',
        store_id: item.StoreId?.[0] || null,
        product_code: item.ItemCode?.[0] || '',
        product_name: item.ItemName?.[0] || '',
        manufacturer: item.ManufacturerName?.[0] || null,
        price: parseFloat(item.ItemPrice?.[0] || '0'),
        unit_quantity: item.UnitQty?.[0] || null,
        unit_of_measure: item.UnitMeasure?.[0] || null,
        price_update_date: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from('store_products')
        .upsert(batch, {
          onConflict: 'product_code,store_chain',
          ignoreDuplicates: false
        })

      if (!error) {
        successCount += batch.length
      } else {
        console.error('Error inserting batch:', error)
      }

      processed += batch.length
      console.log(`Processed ${processed}/${items.length} items`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${successCount} items`,
        count: successCount
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
        error: error.message || 'שגיאה בעיבוד ה-XML'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})