import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CSVRow {
  productCode: string;
  productName: string;
  imageUrl: string;
}

function parseCSV(csvContent: string): CSVRow[] {
  console.log('🔍 מתחיל לנתח CSV...');
  const lines = csvContent.trim().split('\n');
  console.log(`📊 נמצאו ${lines.length} שורות`);
  
  if (lines.length < 2) {
    throw new Error('קובץ CSV חייב להכיל לפחות שורת כותרות ושורה אחת של נתונים');
  }
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  console.log('📋 כותרות:', headers);
  
  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // דלג על שורות ריקות
    
    // התמודדות עם CSV עם גרשיים
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    console.log(`📝 שורה ${i}:`, values);
    
    if (values.length >= 3 && values[0] && values[1] && values[2]) {
      rows.push({
        productCode: values[0],
        productName: values[1],
        imageUrl: values[2]
      });
    } else {
      console.warn(`⚠️ שורה ${i} לא תקינה - חסרים נתונים:`, values);
    }
  }
  
  console.log(`✅ נמצאו ${rows.length} מוצרים תקינים לעיבוד`);
  return rows;
}

async function downloadImage(url: string): Promise<Uint8Array> {
  console.log(`🔽 מוריד תמונה: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image from ${url}: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  console.log(`✅ הורדה הושלמה - גודל: ${arrayBuffer.byteLength} bytes`);
  return new Uint8Array(arrayBuffer);
}

function getImageExtension(url: string, contentType?: string): string {
  if (contentType?.includes('jpeg')) return 'jpg';
  if (contentType?.includes('png')) return 'png';
  if (contentType?.includes('webp')) return 'webp';
  
  const urlLower = url.toLowerCase();
  if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) return 'jpg';
  if (urlLower.includes('.png')) return 'png';
  if (urlLower.includes('.webp')) return 'webp';
  
  return 'jpg'; // default
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

    const { csvContent } = await req.json();
    
    if (!csvContent) {
      throw new Error('חסר תוכן CSV');
    }

    console.log('מעבד קובץ CSV...');
    const rows = parseCSV(csvContent);
    
    const progress = {
      total: rows.length,
      processed: 0,
      succeeded: 0,
      failed: 0
    };

    console.log(`נמצאו ${rows.length} שורות לעיבוד`);

    for (const row of rows) {
      try {
        console.log(`🔄 מעבד מוצר ${progress.processed + 1}/${rows.length}: ${row.productCode} - ${row.productName}`);
        
        // בדיקת URL תקין
        if (!row.imageUrl.startsWith('http')) {
          throw new Error(`URL לא תקין: ${row.imageUrl}`);
        }
        
        // Download image
        const imageData = await downloadImage(row.imageUrl);
        const extension = getImageExtension(row.imageUrl);
        const fileName = `${row.productCode}_${Date.now()}.${extension}`;
        
        console.log(`📤 מעלה לאחסון: ${fileName}`);
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product_images')
          .upload(fileName, imageData, {
            contentType: `image/${extension}`,
            upsert: true
          });

        if (uploadError) {
          console.error(`❌ שגיאה בהעלאת תמונה עבור ${row.productCode}:`, uploadError);
          progress.failed++;
        } else {
          console.log(`✅ הועלתה תמונה בהצלחה עבור ${row.productCode}: ${uploadData.path}`);
          
          // Insert/update product image record
          console.log(`💾 שומר במסד נתונים עבור ${row.productCode}`);
          const { error: dbError } = await supabase
            .from('product_images')
            .upsert({
              product_code: row.productCode,
              product_name: row.productName,
              image_path: uploadData.path,
              is_primary: true,
              status: 'active'
            }, {
              onConflict: 'product_code'
            });

          if (dbError) {
            console.error(`❌ שגיאה בשמירת מידע במסד נתונים עבור ${row.productCode}:`, dbError);
            
            // Clean up uploaded file if DB insert failed
            await supabase.storage
              .from('product_images')
              .remove([uploadData.path]);
              
            progress.failed++;
          } else {
            console.log(`✅ נשמר במסד נתונים בהצלחה עבור ${row.productCode}`);
            progress.succeeded++;
          }
        }
      } catch (error) {
        console.error(`❌ שגיאה בעיבוד מוצר ${row.productCode}:`, error);
        progress.failed++;
      }
      
      progress.processed++;
      
      // עדכון ביניים כל 5 מוצרים
      if (progress.processed % 5 === 0) {
        console.log(`📊 התקדמות: ${progress.processed}/${rows.length} - הצליחו: ${progress.succeeded}, נכשלו: ${progress.failed}`);
      }
    }

    console.log('סיום עיבוד:', progress);

    return new Response(
      JSON.stringify({
        success: true,
        progress,
        message: `הועלו ${progress.succeeded} תמונות מתוך ${progress.total}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('שגיאה בעיבוד קובץ CSV:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'שגיאה בעיבוד הקובץ'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});