import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RamiLevyProduct {
  ItemCode: string;
  ItemType: string;
  ItemName: string;
  ManufacturerName: string;
  ManufactureCountry: string;
  ManufacturerItemDescription: string;
  UnitQty: string;
  Quantity: number;
  bIsWeighted: boolean;
  UnitOfMeasure: string;
  QtyInPackage: number;
  ItemPrice: number;
  UnitOfMeasurePrice: number;
  AllowDiscount: boolean;
  ItemStatus: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting price fetch from Rami Levy...')

    // יצירת חיבור לסופאבייס
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // קבלת פרמטרים מה-request
    const { store_id, branch_id } = await req.json()

    if (!store_id || !branch_id) {
      throw new Error('Missing store_id or branch_id')
    }

    // הורדת הקובץ מרמי לוי
    const url = `http://publishprice.rami-levy.co.il/published/stores/${store_id}/${branch_id}/PriceFull${store_id}${branch_id}.gz`
    console.log('Fetching from URL:', url)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.statusText}`)
    }

    // פענוח הקובץ
    const gzippedData = await response.arrayBuffer()
    const decompressed = new TextDecoder().decode(
      new Uint8Array(gzippedData)
    )

    // פרסור ה-XML
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(decompressed, 'text/xml')
    
    // המרה למערך של מוצרים
    const items = Array.from(xmlDoc.querySelectorAll('Item')).map(item => {
      const getElementText = (tagName: string) => {
        const element = item.querySelector(tagName)
        return element?.textContent || ''
      }

      const product: RamiLevyProduct = {
        ItemCode: getElementText('ItemCode'),
        ItemType: getElementText('ItemType'),
        ItemName: getElementText('ItemName'),
        ManufacturerName: getElementText('ManufacturerName'),
        ManufactureCountry: getElementText('ManufactureCountry'),
        ManufacturerItemDescription: getElementText('ManufacturerItemDescription'),
        UnitQty: getElementText('UnitQty'),
        Quantity: parseFloat(getElementText('Quantity')) || 0,
        bIsWeighted: getElementText('bIsWeighted') === 'true',
        UnitOfMeasure: getElementText('UnitOfMeasure'),
        QtyInPackage: parseFloat(getElementText('QtyInPackage')) || 0,
        ItemPrice: parseFloat(getElementText('ItemPrice')) || 0,
        UnitOfMeasurePrice: parseFloat(getElementText('UnitOfMeasurePrice')) || 0,
        AllowDiscount: getElementText('AllowDiscount') === 'true',
        ItemStatus: getElementText('ItemStatus')
      }

      return product
    })

    console.log(`Found ${items.length} products`)

    // שמירה בדאטהבייס
    const { error: insertError } = await supabase
      .from('store_products_import')
      .upsert(
        items.map(item => ({
          ...item,
          store_chain: 'רמי לוי',
          store_id: branch_id,
          PriceUpdateDate: new Date().toISOString()
        }))
      )

    if (insertError) {
      console.error('Error inserting products:', insertError)
      throw insertError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${items.length} products`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})