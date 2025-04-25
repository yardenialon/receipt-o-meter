// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { IsraeliSupermarketAPI } from './api.ts'

// Base URL for the external API
const EXTERNAL_API_URL = Deno.env.get('EXTERNAL_API_URL') || 'http://localhost:3000'

// Initialize API client
const api = new IsraeliSupermarketAPI(EXTERNAL_API_URL);

console.log("Hello from Functions!")

serve(async (req) => {
  const { method, url } = req
  const { pathname, searchParams } = new URL(url)

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let response: Response;

    // Route the request to the appropriate API method
    if (pathname === '/chains' && method === 'GET') {
      const includeStores = searchParams.get('includeStores') === 'true'
      response = await api.getChains(includeStores)
    }
    else if (pathname.match(/^\/chains\/[^/]+$/) && method === 'GET') {
      const id = pathname.split('/')[2]
      const includeStores = searchParams.get('includeStores') === 'true'
      response = await api.getChainById(id, includeStores)
    }
    else if (pathname.match(/^\/chains\/[^/]+\/stores$/) && method === 'GET') {
      const id = pathname.split('/')[2]
      response = await api.getChainStores(id)
    }
    else if (pathname === '/items/search' && method === 'GET') {
      const query = searchParams.get('query')
      if (!query) {
        return new Response(
          JSON.stringify({ error: 'Query parameter is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      response = await api.searchItems(query)
    }
    else if (pathname.match(/^\/items\/barcode\/[^/]+$/) && method === 'GET') {
      const barcode = pathname.split('/')[3]
      response = await api.getItemByBarcode(barcode)
    }
    else if (pathname.match(/^\/items\/chain\/[^/]+\/stores\/[^/]+\/items\/[^/]+\/price$/) && method === 'GET') {
      const [_, __, chainId, ___, storeId, ____, itemId] = pathname.split('/')
      response = await api.getItemPrice(chainId, storeId, itemId)
    }
    else if (pathname === '/stores' && method === 'GET') {
      const city = searchParams.get('city') || undefined
      const chainObjectId = searchParams.get('chainObjectId') || undefined
      response = await api.getStores(city, chainObjectId)
    }
    else if (pathname === '/stores/chains' && method === 'GET') {
      response = await api.getStoreChains()
    }
    else if (pathname === '/stores/cities' && method === 'GET') {
      response = await api.getStoreCities()
    }
    else if (pathname.match(/^\/stores\/[^/]+$/) && method === 'GET') {
      const id = pathname.split('/')[2]
      response = await api.getStoreById(id)
    }
    else if (pathname.match(/^\/stores\/chain\/[^/]+$/) && method === 'GET') {
      const chainId = pathname.split('/')[3]
      response = await api.getStoresByChain(chainId)
    }
    else if (pathname.match(/^\/stores\/city\/[^/]+$/) && method === 'GET') {
      const city = pathname.split('/')[3]
      const chainObjectId = searchParams.get('chainObjectId') || undefined
      response = await api.getStoresByCity(city, chainObjectId)
    }
    else if (pathname === '/etl-pipeline/run-etl-pipeline' && method === 'POST') {
      response = await api.runEtlPipeline()
    }
    else {
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the response data
    const data = await response.text()

    // Return the response with the same status code and headers
    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    })

  } catch (error) {
    // Handle errors
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
