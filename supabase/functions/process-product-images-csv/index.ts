import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { parse } from 'https://deno.land/std@0.168.0/encoding/csv.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CsvRow {
  SKU: string;
  'Product Name': string;
  'Image URL': string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: 'לא נמצא קובץ' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing CSV file:', file.name);

    // Read and parse CSV
    const csvText = await file.text();
    const records = parse(csvText, {
      skipFirstRow: true,
      columns: ['SKU', 'Product Name', 'Image URL']
    }) as CsvRow[];

    console.log(`Found ${records.length} records in CSV`);

    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each record
    for (const record of records) {
      try {
        if (!record.SKU || !record['Image URL']) {
          errors.push(`שורה חסרה נתונים: ${JSON.stringify(record)}`);
          errorCount++;
          continue;
        }

        // Validate URL
        let imageUrl: URL;
        try {
          imageUrl = new URL(record['Image URL']);
        } catch {
          errors.push(`URL לא תקין: ${record['Image URL']}`);
          errorCount++;
          continue;
        }

        // Check if product exists in store_products
        const { data: productExists } = await supabase
          .from('store_products')
          .select('product_code')
          .eq('product_code', record.SKU)
          .limit(1);

        if (!productExists || productExists.length === 0) {
          errors.push(`מוצר לא נמצא: ${record.SKU}`);
          errorCount++;
          continue;
        }

        console.log(`Processing image for product: ${record.SKU}`);

        // Download image from URL
        let imageResponse: Response;
        try {
          imageResponse = await fetch(record['Image URL']);
          if (!imageResponse.ok) {
            errors.push(`לא ניתן להוריד תמונה עבור ${record.SKU}: ${imageResponse.status}`);
            errorCount++;
            continue;
          }
        } catch (fetchError) {
          errors.push(`שגיאה בהורדת תמונה עבור ${record.SKU}: ${fetchError}`);
          errorCount++;
          continue;
        }

        // Get image data
        const imageBlob = await imageResponse.blob();
        
        // Get file extension from URL or content type
        let fileExtension = 'jpg';
        const urlPath = imageUrl.pathname;
        const urlExtension = urlPath.split('.').pop()?.toLowerCase();
        if (urlExtension && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(urlExtension)) {
          fileExtension = urlExtension;
        } else {
          const contentType = imageResponse.headers.get('content-type');
          if (contentType) {
            if (contentType.includes('png')) fileExtension = 'png';
            else if (contentType.includes('gif')) fileExtension = 'gif';
            else if (contentType.includes('webp')) fileExtension = 'webp';
          }
        }

        // Generate file path for storage
        const fileName = `${record.SKU}_${Date.now()}.${fileExtension}`;
        const storagePath = `product_images/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product_images')
          .upload(storagePath, imageBlob, {
            contentType: imageResponse.headers.get('content-type') || `image/${fileExtension}`,
            upsert: true
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          errors.push(`שגיאה בהעלאת תמונה עבור ${record.SKU}: ${uploadError.message}`);
          errorCount++;
          continue;
        }

        console.log(`Successfully uploaded image for ${record.SKU} to ${storagePath}`);

        // Insert or update product image record in database
        const { error: insertError } = await supabase
          .from('product_images')
          .upsert({
            product_code: record.SKU,
            product_name: record['Product Name'],
            image_path: storagePath, // Store the storage path, not the original URL
            is_primary: false,
            status: 'active'
          }, {
            onConflict: 'product_code,image_path'
          });

        if (insertError) {
          console.error('Error inserting image record:', insertError);
          errors.push(`שגיאה בשמירת רשומת תמונה עבור ${record.SKU}: ${insertError.message}`);
          errorCount++;
          
          // Clean up uploaded file if database insert failed
          await supabase.storage
            .from('product_images')
            .remove([storagePath]);
        } else {
          processedCount++;
          console.log(`Successfully processed image for ${record.SKU}`);
        }

      } catch (error) {
        console.error('Error processing record:', error);
        errors.push(`שגיאה בעיבוד שורה: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`);
        errorCount++;
      }
    }

    console.log(`Processed: ${processedCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        processedCount,
        errorCount,
        errors: errors.slice(0, 10), // Limit errors to first 10
        totalRecords: records.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing CSV:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'שגיאה בעיבוד הקובץ'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});