export async function processDocumentAI(base64Image: string, contentType: string, isPDF: boolean): Promise<{
  items: Array<{ name: string; price: number; quantity?: number }>;
  total: number;
  storeName: string;
}> {
  const apiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
  if (!apiKey) {
    throw new Error('Missing Google Cloud API key');
  }

  // Use the general Document processor for now since we don't have a specific receipt processor
  const projectId = '1234567890'; // Replace with your actual Google Cloud project ID
  const location = 'us'; // The location where your processor is deployed
  const processorId = 'pretrained-ocr'; // Using the general OCR processor

  try {
    console.log('Starting Document AI processing...');
    
    const endpoint = `https://documentai.googleapis.com/v1/projects/${projectId}/locations/${location}/processors/${processorId}:process`;
    
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
      throw new Error(`Document AI API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Document AI response:', JSON.stringify(result, null, 2));

    // Extract text from the document
    const text = result.document?.text || '';
    console.log('Extracted text:', text);

    // For now, we'll use a simple parsing approach
    // This can be enhanced later with more sophisticated parsing logic
    const lines = text.split('\n').filter(line => line.trim());
    
    // Try to find the store name (usually at the top)
    const storeName = lines[0] || 'חנות לא ידועה';
    
    // Look for items and prices
    const items: Array<{ name: string; price: number; quantity?: number }> = [];
    let total = 0;

    for (const line of lines) {
      // Look for price patterns (numbers followed by ₪ or preceded by ₪)
      const priceMatch = line.match(/(\d+\.?\d*)\s*₪|₪\s*(\d+\.?\d*)/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1] || priceMatch[2]);
        // Remove the price from the line to get the item name
        const name = line.replace(/(\d+\.?\d*)\s*₪|₪\s*(\d+\.?\d*)/, '').trim();
        
        if (name && price) {
          items.push({ name, price });
          total += price;
        }
      }
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