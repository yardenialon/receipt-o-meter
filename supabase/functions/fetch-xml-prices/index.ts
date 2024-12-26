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

    // Validate URL format
    if (!driveUrl.includes('drive.google.com')) {
      throw new Error('הקישור חייב להיות מ-Google Drive')
    }

    // Extract file ID from Google Drive URL
    const fileId = driveUrl.match(/\/d\/([^/]+)/)?.[1] || driveUrl.match(/id=([^&]+)/)?.[1]
    if (!fileId) {
      console.error('Invalid Drive URL format:', driveUrl)
      throw new Error('כתובת ה-URL אינה תקינה. אנא ודא שזו כתובת שיתוף תקינה של Google Drive')
    }
    console.log('Extracted file ID:', fileId)

    // Try different Google Drive URL formats
    const urls = [
      `https://drive.google.com/uc?export=download&id=${fileId}`,
      `https://drive.google.com/uc?id=${fileId}`,
      `https://docs.google.com/uc?export=download&id=${fileId}`
    ]

    let xmlText = null
    let error = null

    // Try each URL format until we get a valid XML response
    for (const url of urls) {
      try {
        console.log('Attempting to fetch from URL:', url)
        const response = await fetch(url)
        
        if (!response.ok) {
          console.error('Failed to fetch from', url, ':', response.status, response.statusText)
          continue
        }

        const content = await response.text()
        console.log('Response content type:', response.headers.get('content-type'))
        console.log('First 100 characters:', content.substring(0, 100))

        // Check if we got HTML instead of XML
        if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
          console.error('Received HTML instead of XML from:', url)
          continue
        }

        // Basic XML validation
        if (!content.includes('<?xml') && !content.includes('<Item>')) {
          console.error('Content does not appear to be XML from:', url)
          continue
        }

        xmlText = content
        break
      } catch (e) {
        error = e
        console.error('Error fetching from', url, ':', e)
      }
    }

    if (!xmlText) {
      throw new Error('הקובץ אינו נגיש. אנא ודא שהקובץ משותף לכל מי שיש לו את הקישור (Anyone with the link) ושהוא קובץ XML תקין')
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
      throw new Error('לא נמצאו פריטים בקובץ ה-XML. אנא ודא שהקובץ מכיל תגיות <Item>')
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