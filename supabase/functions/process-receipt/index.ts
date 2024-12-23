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
    console.log('Starting receipt processing...')
    const formData = await req.formData()
    const file = formData.get('file')
    const receiptId = formData.get('receiptId')

    if (!file || !receiptId) {
      throw new Error('Missing file or receipt ID')
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))

    console.log('Calling OCR API...')
    // Call OCR API
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': Deno.env.get('OCR_SPACE_API_KEY') ?? '',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'base64Image': `data:${file.type};base64,${base64}`,
        'language': 'heb',
        'detectOrientation': 'true',
        'scale': 'true',
        'OCREngine': '2',
      }),
    })

    const ocrResult = await response.json()
    console.log('OCR Result:', JSON.stringify(ocrResult))

    if (!ocrResult.ParsedResults?.[0]?.ParsedText) {
      throw new Error('Failed to extract text from image')
    }

    const text = ocrResult.ParsedResults[0].ParsedText
    const lines = text.split('\n')
    
    // Initialize variables
    const items = []
    let total = 0
    let storeName = ''

    console.log('Extracted text lines:', lines)

    // Try to find store name in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim()
      if (line && line.length > 2) {
        storeName = line
        break
      }
    }

    // Process lines to find items and prices
    const pricePattern = /\d+\.?\d*/
    for (const line of lines) {
      const priceMatch = line.match(pricePattern)
      if (priceMatch) {
        const price = parseFloat(priceMatch[0])
        if (!isNaN(price)) {
          const name = line.replace(priceMatch[0], '').trim()
          if (name && price > 0) {
            items.push({ name, price })
            // Update total with the highest price found
            if (price > total) {
              total = price
            }
          }
        }
      }
    }

    console.log('Extracted items:', items)
    console.log('Total:', total)
    console.log('Store name:', storeName)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update receipt with store name and total
    const { error: updateError } = await supabase
      .from('receipts')
      .update({ 
        store_name: storeName,
        total: total 
      })
      .eq('id', receiptId)

    if (updateError) {
      console.error('Error updating receipt:', updateError)
      throw updateError
    }

    // Insert receipt items
    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from('receipt_items')
        .insert(items.map(item => ({
          receipt_id: receiptId,
          name: item.name,
          price: item.price,
          quantity: 1
        })))

      if (itemsError) {
        console.error('Error inserting items:', itemsError)
        throw itemsError
      }
    }

    return new Response(
      JSON.stringify({ success: true, items, total, storeName }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error processing receipt:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    )
  }
})