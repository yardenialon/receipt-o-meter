import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { parseXMLContent } from "./xml-parser.ts";
import { insertProducts } from "./db-operations.ts";
import { mapProductData } from "./product-mapper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting file processing...');
    
    const contentType = req.headers.get('content-type');
    console.log('Content-Type:', contentType);

    let data;
    
    // Handle different content types
    if (contentType?.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      
      if (!file) {
        throw new Error('No file in form data');
      }
      
      console.log('File info:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      data = await file.text();
    } else {
      // If not form-data, try to read directly as text
      const requestData = await req.json();
      data = requestData.xmlContent;
    }

    // Check if we received data
    if (!data) {
      throw new Error('No data received');
    }

    console.log('Data length:', data.length);
    console.log('First 200 characters:', data.substring(0, 200));

    // Parse XML and get items
    const items = await parseXMLContent(data);
    
    if (!items || items.length === 0) {
      throw new Error('לא נמצאו פריטים בקובץ ה-XML');
    }

    // Map and validate products
    const products = items
      .map(mapProductData)
      .filter(Boolean);

    console.log('Valid products count:', products.length);
    
    if (products.length === 0) {
      throw new Error('לא נמצאו מוצרים תקינים בקובץ');
    }

    console.log('Sample processed product:', products[0]);
    
    const insertedCount = await insertProducts(products);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `נשמרו ${insertedCount} מוצרים בהצלחה`,
        count: insertedCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'שגיאה בעיבוד ה-XML',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});