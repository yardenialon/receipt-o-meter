import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getBrowserHeaders, getTodayFileName, fetchAndDecompressFile } from "./utils/fileHandler.ts";
import { parseXmlContent, transformProducts } from "./utils/dataTransformer.ts";
import { createSupabaseClient, processItems } from "./utils/databaseHandler.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Shufersal price fetch...');
    
    // Try direct file access first
    const fileName = getTodayFileName();
    const directUrl = `https://prices.shufersal.co.il/${fileName}`;
    
    try {
      console.log('Attempting direct file access:', directUrl);
      const xmlText = await fetchAndDecompressFile(directUrl);
      const items = parseXmlContent(xmlText);
      const transformedProducts = transformProducts(items);
      
      const supabase = createSupabaseClient();
      const successCount = await processItems(supabase, transformedProducts);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully processed ${successCount} items` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } catch (directAccessError) {
      console.log('Direct access failed, trying directory listing');
      
      const response = await fetch('https://prices.shufersal.co.il/', { 
        headers: getBrowserHeaders() 
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch price files list: ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      const gzFiles = html.match(/href=['"]([^'"]*\.gz)['"]/g);
      
      if (!gzFiles?.length) {
        throw new Error('No price files found in the directory listing');
      }
      
      const mostRecentFile = gzFiles[gzFiles.length - 1].match(/href=['"]([^'"]*\.gz)['"]/)?.[1];
      if (!mostRecentFile) {
        throw new Error('Could not extract file name from directory listing');
      }
      
      const fileUrl = `https://prices.shufersal.co.il/${mostRecentFile}`;
      const xmlText = await fetchAndDecompressFile(fileUrl);
      const items = parseXmlContent(xmlText);
      const transformedProducts = transformProducts(items);
      
      const supabase = createSupabaseClient();
      const successCount = await processItems(supabase, transformedProducts);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully processed ${successCount} items` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});