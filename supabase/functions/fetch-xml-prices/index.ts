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
      throw new Error('Invalid Drive URL format')
    }
    console.log('Extracted file ID:', fileId)

    // Fetch file from Google Drive
    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
    const response = await fetch(directUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`)
    }

    const xmlText = await response.text()
    console.log('Received XML content length:', xmlText.length)

    if (xmlText.includes('<!DOCTYPE html>')) {
      throw new Error('Received HTML instead of XML. Make sure the file is shared publicly')
    }

    // Parse XML
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
    const items = xmlDoc.getElementsByTagName('Item')
    console.log(`Found ${items.length} items in XML`)

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
      console.log(`Uploaded ${successCount}/${products.length} products`)
    }

    return new Response(
      JSON.stringify({ success: true, count: successCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})