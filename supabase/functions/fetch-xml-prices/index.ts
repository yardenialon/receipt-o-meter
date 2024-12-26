import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const { driveUrl } = await req.json()
    console.log('Processing Drive URL:', driveUrl)

    // Extract file ID from Google Drive URL
    const fileId = driveUrl.match(/\/d\/([^/]+)/)?.[1]
    if (!fileId) {
      throw new Error('כתובת ה-URL אינה תקינה. אנא ודא שזו כתובת שיתוף תקינה של Google Drive')
    }
    console.log('Extracted file ID:', fileId)

    // Fetch file from Google Drive
    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
    console.log('Attempting to fetch from URL:', directUrl)
    
    const response = await fetch(directUrl)
    if (!response.ok) {
      console.error('Failed to fetch file:', response.status, response.statusText)
      throw new Error(`שגיאה בהורדת הקובץ (${response.status}). אנא ודא שהקובץ נגיש`)
    }

    const xmlText = await response.text()
    console.log('Received content length:', xmlText.length)
    console.log('First 100 characters:', xmlText.substring(0, 100))

    if (xmlText.includes('<!DOCTYPE html>')) {
      console.error('Received HTML instead of XML content')
      throw new Error('הקובץ אינו נגיש. אנא ודא שהקובץ משותף לכל מי שיש לו את הקישור (Anyone with the link)')
    }

    // Parse XML
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror')
    if (parserError) {
      console.error('XML parsing error:', parserError.textContent)
      throw new Error('קובץ ה-XML אינו תקין. אנא ודא שהקובץ תקין ונסה שוב')
    }
    
    const items = xmlDoc.getElementsByTagName('Item')
    console.log(`Found ${items.length} items in XML`)

    if (items.length === 0) {
      throw new Error('לא נמצאו פריטים בקובץ ה-XML')
    }

    // Convert items to products
    const products = Array.from(items).map(item => ({
      store_chain: 'שופרסל',
      store_id: item.getElementsByTagName('StoreId')?.[0]?.textContent || null,
      product_code: item.getElementsByTagName('ItemCode')?.[0]?.textContent || '',
      product_name: item.getElementsByTagName('ItemName')?.[0]?.textContent || '',
      manufacturer: item.getElementsByTagName('ManufacturerName')?.[0]?.textContent || null,
      price: parseFloat(item.getElementsByTagName('ItemPrice')?.[0]?.textContent || '0'),
      unit_quantity: item.getElementsByTagName('UnitQty')?.[0]?.textContent || null,
      unit_of_measure: item.getElementsByTagName('UnitMeasure')?.[0]?.textContent || null,
      price_update_date: new Date().toISOString(),
    }))

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Upload products in batches
    const batchSize = 100
    let successCount = 0
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(products.length / batchSize)}`)
      
      const { error } = await supabase
        .from('store_products')
        .upsert(batch, {
          onConflict: 'product_code,store_chain',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Error uploading batch:', error)
        throw error
      }

      successCount += batch.length
      console.log(`Successfully uploaded ${successCount}/${products.length} products`)
    }

    return new Response(
      JSON.stringify({ success: true, count: successCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'שגיאה לא ידועה בעיבוד הקובץ'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})