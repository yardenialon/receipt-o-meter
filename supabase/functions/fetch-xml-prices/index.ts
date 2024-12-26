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

    console.log('Received content length:', xmlContent.length)
    
    // Try to extract XML content if it's wrapped in HTML
    let cleanXmlContent = xmlContent
    if (xmlContent.includes('<!DOCTYPE html>') || xmlContent.includes('<html')) {
      console.log('Content appears to be HTML, attempting to extract XML...')
      // Look for XML content between pre tags
      const preMatch = xmlContent.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i)
      if (preMatch && preMatch[1]) {
        cleanXmlContent = preMatch[1]
        console.log('Found XML content inside <pre> tags')
      } else {
        // Try to find content between xml tags
        const xmlMatch = xmlContent.match(/<\?xml[\s\S]*?<\/[^>]*>/)
        if (xmlMatch) {
          cleanXmlContent = xmlMatch[0]
          console.log('Found XML content using regex')
        }
      }
    }

    // Decode HTML entities if present
    cleanXmlContent = cleanXmlContent
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()

    // Basic XML validation
    if (!cleanXmlContent.includes('<?xml')) {
      console.error('Content does not appear to be XML')
      throw new Error('לא נמצא תוכן XML תקין בקובץ. אנא העתק את תוכן ה-XML עצמו')
    }

    // Parse XML with better error handling
    console.log('Parsing XML content...')
    console.log('First 100 characters:', cleanXmlContent.substring(0, 100))
    
    let data
    try {
      data = xmlParse(cleanXmlContent)
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