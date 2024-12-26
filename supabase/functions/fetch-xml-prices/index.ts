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

    // Use Google Drive API to download the file
    const apiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY')
    if (!apiKey) {
      throw new Error('Google API key is not configured')
    }

    console.log('Fetching file metadata from Google Drive API')
    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?key=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!metadataResponse.ok) {
      console.error('Failed to fetch file metadata:', await metadataResponse.text())
      throw new Error('שגיאה בגישה לקובץ. אנא ודא שהקובץ קיים ונגיש')
    }

    const metadata = await metadataResponse.json()
    console.log('File metadata:', metadata)

    console.log('Downloading file content from Google Drive API')
    const contentResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`,
      {
        headers: {
          'Accept': 'text/xml',
        }
      }
    )

    if (!contentResponse.ok) {
      console.error('Failed to download file:', await contentResponse.text())
      throw new Error('שגיאה בהורדת הקובץ. אנא ודא שהקובץ נגיש')
    }

    const xmlText = await contentResponse.text()
    console.log('Received content length:', xmlText.length)
    console.log('First 100 characters:', xmlText.substring(0, 100))

    // Basic XML validation
    if (!xmlText.includes('<?xml') && !xmlText.includes('<Item>')) {
      console.error('Content does not appear to be XML')
      throw new Error('הקובץ אינו בפורמט XML תקין')
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