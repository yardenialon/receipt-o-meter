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
      console.error('Missing file or receipt ID')
      throw new Error('Missing file or receipt ID')
    }

    console.log('Processing receipt:', { receiptId })

    // Convert file to base64
    const buffer = await file.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))

    console.log('Calling OCR API...')
    // Call OCR API with improved error handling
    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
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
        'isTable': 'true',
      }),
    })

    if (!ocrResponse.ok) {
      console.error('OCR API error:', await ocrResponse.text())
      throw new Error('OCR API request failed')
    }

    const ocrResult = await ocrResponse.json()
    console.log('OCR API Response:', JSON.stringify(ocrResult))

    if (!ocrResult.ParsedResults?.[0]?.ParsedText) {
      console.error('Failed to extract text from image:', ocrResult)
      throw new Error('Failed to extract text from image')
    }

    const text = ocrResult.ParsedResults[0].ParsedText
    const lines = text.split('\n').filter(line => line.trim())
    
    console.log('Extracted text lines:', lines)

    // Initialize variables
    const items = []
    let total = 0
    let storeName = ''

    // Try to find store name in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim()
      if (line && line.length > 2 && !line.match(/^\d/)) {
        storeName = line
        console.log('Found store name:', storeName)
        break
      }
    }

    // Process lines to find items and prices with improved pattern matching
    const pricePattern = /(\d+\.?\d*)/
    const skipWords = ['סהכ', 'מעמ', 'שקל', 'תשלום', 'מזומן', 'אשראי']
    
    for (const line of lines) {
      // Skip lines containing words we want to ignore
      if (skipWords.some(word => line.includes(word))) {
        continue
      }

      const priceMatch = line.match(pricePattern)
      if (priceMatch) {
        const price = parseFloat(priceMatch[1])
        if (!isNaN(price) && price > 0) {
          // Remove the price and any trailing spaces/special characters
          const name = line
            .replace(priceMatch[0], '')
            .replace(/[^\w\s\u0590-\u05FF]/g, '')
            .trim()

          if (name && price > 0 && !name.match(/^[\d\s]+$/)) {
            items.push({ name, price })
            total += price
            console.log('Found item:', { name, price })
          }
        }
      }
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Updating receipt with extracted data...')
    // Update receipt with store name and total
    const { error: updateError } = await supabase
      .from('receipts')
      .update({ 
        store_name: storeName || 'חנות לא ידועה',
        total: total || 0
      })
      .eq('id', receiptId)

    if (updateError) {
      console.error('Error updating receipt:', updateError)
      throw updateError
    }

    console.log('Adding receipt items...')
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

    console.log('Receipt processing completed successfully')
    return new Response(
      JSON.stringify({ 
        success: true, 
        items, 
        total, 
        storeName,
        message: items.length > 0 ? `זוהו ${items.length} פריטים בקבלה` : 'לא זוהו פריטים בקבלה'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error processing receipt:', error)

    // Update receipt status to error state
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        const receiptId = req.formData().then(form => form.get('receiptId'))
        
        if (receiptId) {
          await supabase
            .from('receipts')
            .update({ 
              store_name: 'שגיאה בעיבוד',
              total: 0
            })
            .eq('id', receiptId)
        }
      }
    } catch (updateError) {
      console.error('Error updating receipt status:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
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