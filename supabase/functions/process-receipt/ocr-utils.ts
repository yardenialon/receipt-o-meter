interface OCRResult {
  items: Array<{ name: string; price: number; quantity?: number }>;
  total: number;
  storeName: string;
}

async function processDocumentAI(imageBytes: string, contentType: string, isPDF: boolean): Promise<OCRResult> {
  const apiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
  if (!apiKey) {
    throw new Error('Missing Google Cloud API key');
  }

  try {
    // First, process the document using Document AI
    const response = await fetch(
      `https://documentai.googleapis.com/v1/projects/1234567890/locations/us/processors/RECEIPT_PROCESSOR_ID/process`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawDocument: {
            content: imageBytes,
            mimeType: contentType,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Document AI API error:', error);
      throw new Error(`שגיאה בזיהוי הקבלה: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Document AI response:', result);

    // Extract structured data from the Document AI response
    const document = result.document;
    const entities = document.entities || [];
    
    // Initialize variables
    let total = 0;
    let storeName = '';
    const items: Array<{ name: string; price: number; quantity?: number }> = [];

    // Process entities
    entities.forEach((entity: any) => {
      switch (entity.type) {
        case 'receipt_total':
          total = parseFloat(entity.mentionText) || 0;
          break;
        case 'supplier_name':
          storeName = entity.mentionText || '';
          break;
        case 'line_item':
          const item = {
            name: entity.mentionText || '',
            price: 0,
            quantity: 1
          };

          // Look for associated properties
          entity.properties?.forEach((prop: any) => {
            if (prop.type === 'line_item_price') {
              item.price = parseFloat(prop.mentionText) || 0;
            } else if (prop.type === 'line_item_quantity') {
              item.quantity = parseFloat(prop.mentionText) || 1;
            }
          });

          if (item.name && item.price > 0) {
            items.push(item);
          }
          break;
      }
    });

    console.log('Extracted data:', { storeName, total, itemCount: items.length });
    return { items, total, storeName };
  } catch (error) {
    console.error('Error in Document AI processing:', error);
    throw new Error(`שגיאה בעיבוד הקבלה: ${error.message}`);
  }
}

export { processDocumentAI };