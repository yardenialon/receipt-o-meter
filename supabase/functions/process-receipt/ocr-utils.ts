export async function processDocumentAI(base64Image: string, contentType: string, isPDF: boolean): Promise<{
  items: Array<{ name: string; price: number; quantity?: number }>;
  total: number;
  storeName: string;
}> {
  const apiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
  if (!apiKey) {
    throw new Error('Missing Google Cloud API key');
  }

  // Using the specific project and processor details
  const projectId = 'cloud-vision-api-445700';
  const location = 'us'; // Default to US location
  const processorId = 'pretrained-ocr';

  try {
    console.log('Starting Document AI processing...');
    
    const endpoint = `https://documentai.googleapis.com/v1/projects/${projectId}/locations/${location}/processors/${processorId}:process`;
    
    console.log('Making request to endpoint:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rawDocument: {
          content: base64Image,
          mimeType: contentType,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Document AI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`שגיאה בזיהוי הקבלה: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Document AI response:', JSON.stringify(result, null, 2));

    // Extract text from the document
    const text = result.document?.text || '';
    console.log('Extracted text:', text);

    // Parse the text into lines and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim());
    
    // Try to find the store name (usually at the top)
    const storeName = lines[0] || 'חנות לא ידועה';
    
    // Look for items and prices
    const items: Array<{ name: string; price: number; quantity?: number }> = [];
    let total = 0;

    // Improved price detection regex for Hebrew receipts
    const priceRegex = /(?:₪|ש"ח|שח)\s*(\d+\.?\d*)|(\d+\.?\d*)\s*(?:₪|ש"ח|שח)/;

    for (const line of lines) {
      const priceMatch = line.match(priceRegex);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1] || priceMatch[2]);
        // Remove the price and currency symbols from the line to get the item name
        const name = line.replace(priceRegex, '').trim();
        
        if (name && price && !isNaN(price)) {
          // Look for quantity patterns (e.g., "2 יח'" or "x2")
          const quantityMatch = name.match(/(\d+)\s*(?:יח'?|×|x)/i);
          const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
          
          const cleanName = name.replace(/\d+\s*(?:יח'?|×|x)/i, '').trim();
          
          items.push({ 
            name: cleanName, 
            price,
            quantity
          });
          total += price * quantity;
        }
      }
    }

    // If no total was found in the regular parsing, use the sum of items
    if (total === 0 && items.length > 0) {
      total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    }

    console.log('Parsed results:', {
      storeName,
      items,
      total
    });

    return {
      items,
      total,
      storeName
    };
  } catch (error) {
    console.error('Error processing document:', error);
    throw new Error(`שגיאה בעיבוד הקבלה: ${error.message}`);
  }
}