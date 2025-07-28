import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface CSVRow {
  productCode: string;
  productName: string;
  imageUrl: string;
}

function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.trim().split('\n');
  const rows: CSVRow[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(',').map(col => col.trim().replace(/"/g, ''));
    
    if (columns.length >= 3) {
      rows.push({
        productCode: columns[0],
        productName: columns[1],
        imageUrl: columns[2]
      });
    }
  }
  
  return rows;
}

async function downloadImage(url: string): Promise<Uint8Array> {
  console.log(`מוריד תמונה מ: ${url}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType?.startsWith('image/')) {
    throw new Error('URL does not point to an image');
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

function getImageExtension(url: string, contentType?: string): string {
  if (contentType) {
    if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg';
    if (contentType.includes('png')) return 'png';
    if (contentType.includes('webp')) return 'webp';
    if (contentType.includes('gif')) return 'gif';
  }
  
  const urlLower = url.toLowerCase();
  if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) return 'jpg';
  if (urlLower.includes('.png')) return 'png';
  if (urlLower.includes('.webp')) return 'webp';
  if (urlLower.includes('.gif')) return 'gif';
  
  return 'jpg'; // Default
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvContent } = await req.json();
    
    if (!csvContent) {
      return new Response(
        JSON.stringify({ success: false, error: 'לא התקבל תוכן CSV' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('מתחיל עיבוד קובץ CSV...');
    const rows = parseCSV(csvContent);
    console.log(`נמצאו ${rows.length} שורות בקובץ CSV`);

    let succeeded = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      console.log(`מעבד שורה ${i + 1}/${rows.length}: ${row.productCode}`);

      try {
        // Download image
        const imageData = await downloadImage(row.imageUrl);
        const extension = getImageExtension(row.imageUrl);
        const fileName = `${row.productCode}_${Date.now()}.${extension}`;
        const filePath = `products/${fileName}`;

        // Upload to Supabase storage
        const { error: storageError } = await supabase.storage
          .from('product_images')
          .upload(filePath, imageData, {
            contentType: `image/${extension}`,
            upsert: false
          });

        if (storageError) {
          throw new Error(`Storage upload failed: ${storageError.message}`);
        }

        // Save to database
        const { error: dbError } = await supabase
          .from('product_images')
          .insert({
            product_code: row.productCode,
            image_path: filePath,
            is_primary: false
          });

        if (dbError) {
          // If image was uploaded but DB insert failed, try to clean up storage
          await supabase.storage.from('product_images').remove([filePath]);
          throw new Error(`Database insert failed: ${dbError.message}`);
        }

        succeeded++;
        console.log(`הצליח: ${row.productCode}`);

      } catch (error) {
        failed++;
        const errorMsg = `שגיאה במוצר ${row.productCode}: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    const progress = {
      total: rows.length,
      processed: rows.length,
      succeeded,
      failed
    };

    console.log(`סיום עיבוד. הצליח: ${succeeded}, נכשל: ${failed}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        progress,
        errors: errors.slice(0, 10) // Return first 10 errors only
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('שגיאה כללית:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'שגיאה לא ידועה'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});