import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { parse } from 'https://deno.land/std@0.181.0/encoding/csv.ts'

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

    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded')
    }

    console.log('Processing file:', file.name)

    // Read the file content
    const fileContent = await file.text()
    
    // Parse CSV
    const records = parse(fileContent, {
      skipFirstRow: true,
      columns: ['source_chain_id', 'source_chain_name', 'our_chain_id', 'mapping_status']
    })

    console.log(`Parsed ${records.length} records from CSV`)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Process records
    const { error } = await supabase
      .from('chain_mappings')
      .upsert(
        records.map((record: any) => ({
          source_chain_id: record.source_chain_id,
          source_chain_name: record.source_chain_name,
          our_chain_id: record.our_chain_id,
          mapping_status: record.mapping_status || 'active'
        })),
        { onConflict: 'source_chain_id' }
      )

    if (error) {
      console.error('Error inserting records:', error)
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${records.length} mappings`
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
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})