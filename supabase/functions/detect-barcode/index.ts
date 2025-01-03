import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { ImageAnnotatorClient } from 'https://googleapis.deno.dev/v1/vision:v1.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData();
    const image = formData.get('image');
    
    if (!image || !(image instanceof File)) {
      throw new Error('No image file provided');
    }

    console.log('Processing image for barcode detection');

    // Initialize the Vision API client
    const vision = new ImageAnnotatorClient({
      credentials: JSON.parse(Deno.env.get('GOOGLE_SERVICE_ACCOUNT') || '{}'),
    });

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const imageBytes = new Uint8Array(arrayBuffer);

    // Detect barcode
    const [result] = await vision.batchAnnotateImages({
      requests: [{
        image: {
          content: Array.from(imageBytes)
        },
        features: [{
          type: 'TEXT_DETECTION'
        }]
      }]
    });

    console.log('Vision API response:', result);

    // Extract barcode from the detected text
    const barcode = result.responses?.[0]?.textAnnotations?.[0]?.description
      ?.split('\n')
      ?.find(text => /^\d{13}$/.test(text)); // Look for 13-digit numbers (EAN-13 format)

    if (!barcode) {
      throw new Error('No barcode detected in image');
    }

    console.log('Detected barcode:', barcode);

    return new Response(
      JSON.stringify({ barcode }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});