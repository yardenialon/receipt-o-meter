interface DocumentAIResult {
  items: Array<{ name: string; price: number; quantity?: number }>;
  total: number;
  storeName: string;
}

export async function processDocument(
  base64Image: string, 
  contentType: string, 
  isPDF: boolean,
  accessToken: string
): Promise<DocumentAIResult> {
  // Use the correct project ID from your Google Cloud Console
  const projectId = Deno.env.get('GOOGLE_PROJECT_ID') || '';
  const location = 'us'; // או 'eu' - תלוי באיזור שבחרת
  const processorId = '9c913ce7c435a20e'; // המזהה החדש שיצרת
  
  console.log('Making Document AI API request with project:', projectId);
  const endpoint = `https://us-documentai.googleapis.com/v1/projects/${projectId}/locations/${location}/processors/${processorId}:process`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
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
    throw new Error(`Error processing document: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log('Document AI response received');

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
      const name = line.replace(priceRegex, '').trim();
      
      if (name && price && !isNaN(price)) {
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
    itemCount: items.length,
    total
  });

  return {
    items,
    total,
    storeName
  };
}