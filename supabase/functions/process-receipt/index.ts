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
    const formData = await req.formData()
    const file = formData.get('file')
    const receiptId = formData.get('receiptId')

    if (!file || !receiptId) {
      throw new Error('Missing file or receipt ID')
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Convert file to base64
    const buffer = await file.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))

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
        'isOverlayRequired': 'false',
        'detectOrientation': 'true',
      }),
    })

    const ocrResult = await response.json()
    console.log('OCR Result:', ocrResult)

    if (!ocrResult.ParsedResults?.[0]?.ParsedText) {
      throw new Error('Failed to extract text from image')
    }

    // Process the OCR result to extract items and total
    const text = ocrResult.ParsedResults[0].ParsedText
    const lines = text.split('\n')
    
    // Simple regex patterns for price extraction
    const pricePattern = /\d+\.?\d*/
    const items = []
    let total = 0

    for (const line of lines) {
      const priceMatch = line.match(pricePattern)
      if (priceMatch) {
        const price = parseFloat(priceMatch[0])
        const name = line.replace(priceMatch[0], '').trim()
        if (name && price) {
          items.push({ name, price })
        }
        // Assume the largest number is the total
        if (price > total) {
          total = price
        }
      }
    }

    // Update receipt total
    await supabase
      .from('receipts')
      .update({ total })
      .eq('id', receiptId)

    // Insert receipt items
    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from('receipt_items')
        .insert(items.map(item => ({
          receipt_id: receiptId,
          name: item.name,
          price: item.price
        })))

      if (itemsError) throw itemsError
    }

    return new Response(
      JSON.stringify({ success: true, items, total }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing receipt:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})