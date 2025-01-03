import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, handleCors } from './utils/cors.ts'
import { validateRequest } from './utils/validation.ts'
import { processFileContent } from './utils/fileProcessing.ts'
import { createSupabaseClient, processItems } from './utils/database.ts'

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    console.log('Processing request...');
    const formData = await req.formData();
    
    // Validate request and extract data
    const { file, networkName, branchName, storeAddress } = validateRequest(formData);

    console.log('Request data:', {
      fileName: file.name,
      fileSize: file.size,
      networkName,
      branchName,
      storeAddress
    });

    // Create Supabase client
    const supabase = createSupabaseClient();

    // Process file content and get items
    const items = await processFileContent(file as File);
    console.log(`Found ${items.length} items in file`);

    // Process items in batches and insert into database
    const processedCount = await processItems(supabase, items, {
      networkName: networkName as string,
      branchName: branchName as string,
      storeAddress: storeAddress as string
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `עובדו ${processedCount} מוצרים בהצלחה`,
        itemsProcessed: processedCount
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
        error: error.message || 'שגיאה בעיבוד הבקשה',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});