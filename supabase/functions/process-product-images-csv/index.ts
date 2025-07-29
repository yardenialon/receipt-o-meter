import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { parse } from 'https://deno.land/std@0.168.0/encoding/csv.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CsvRow {
  product_code: string;
  image_url: string;
  is_primary?: string;
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
      columns: ['product_code', 'image_url', 'is_primary']
    }) as CsvRow[];

    console.log(`Found ${records.length} records in CSV`);

    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each record
    for (const record of records) {
      try {
        if (!record.product_code || !record.image_url) {
          errors.push(`שורה חסרה נתונים: ${JSON.stringify(record)}`);
          errorCount++;
          continue;
        }

        // Validate URL
        try {
          new URL(record.image_url);
        } catch {
          errors.push(`URL לא תקין: ${record.image_url}`);
          errorCount++;
          continue;
        }

        // Parse is_primary
        const isPrimary = record.is_primary?.toLowerCase() === 'true';

        // Check if product exists in store_products
        const { data: productExists } = await supabase
          .from('store_products')
          .select('product_code')
          .eq('product_code', record.product_code)
          .limit(1);

        if (!productExists || productExists.length === 0) {
          errors.push(`מוצר לא נמצא: ${record.product_code}`);
          errorCount++;
          continue;
        }

        // If this is set as primary, update other images for this product to not be primary
        if (isPrimary) {
          await supabase
            .from('product_images')
            .update({ is_primary: false })
            .eq('product_code', record.product_code);
        }

        // Insert or update product image
        const { error: insertError } = await supabase
          .from('product_images')
          .upsert({
            product_code: record.product_code,
            image_path: record.image_url,
            is_primary: isPrimary,
            status: 'active'
          }, {
            onConflict: 'product_code,image_path'
          });

        if (insertError) {
          console.error('Error inserting image:', insertError);
          errors.push(`שגיאה בהכנסת תמונה עבור ${record.product_code}: ${insertError.message}`);
          errorCount++;
        } else {
          processedCount++;
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