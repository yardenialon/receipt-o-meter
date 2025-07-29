
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Base URL for the Open Israeli Supermarkets API
const API_BASE_URL = "https://www.openisraelisupermarkets.co.il/api";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();
    const API_TOKEN = Deno.env.get("OPEN_ISRAELI_MARKETS_TOKEN");

    if (!API_TOKEN) {
      console.error("API token not configured");
      return new Response(
        JSON.stringify({ error: "API token not configured" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Processing request: ${action} with params:`, params);

    let endpoint = "";
    let queryParams = new URLSearchParams();

    // Configure endpoint and parameters based on action
    switch (action) {
      case "listChains":
        endpoint = "/chains";
        break;
      case "listStores":
        endpoint = "/stores";
        if (params?.chainId) {
          queryParams.append("chain_id", params.chainId);
        }
        break;
      case "searchProducts":
        endpoint = "/products/search";
        if (params?.query) {
          queryParams.append("query", params.query);
        }
        if (params?.chainId) {
          queryParams.append("chain_id", params.chainId);
        }
        if (params?.storeId) {
          queryParams.append("store_id", params.storeId);
        }
        break;
      case "getProductPrices":
        endpoint = "/products/prices";
        if (params?.productCode) {
          queryParams.append("product_code", params.productCode);
        }
        if (params?.chainIds && Array.isArray(params.chainIds)) {
          params.chainIds.forEach((id: string) => {
            queryParams.append("chain_ids[]", id);
          });
        }
        if (params?.storeIds && Array.isArray(params.storeIds)) {
          params.storeIds.forEach((id: string) => {
            queryParams.append("store_ids[]", id);
          });
        }
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }

    // Construct the full URL
    const url = `${API_BASE_URL}${endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    console.log(`Fetching from: ${url}`);

    // Make request to the API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      return new Response(
        JSON.stringify({ error: `API request failed with status ${response.status}`, details: errorText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }

    const data = await response.json();
    
    console.log(`Response received successfully with ${JSON.stringify(data).length} characters`);

    // Return the data from the API
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in fetch-open-israeli-prices function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
