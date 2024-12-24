import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface ProcessedItem {
  name: string;
  price: number;
  quantity?: number;
}

export async function processDocument(
  base64Image: string,
  contentType: string,
  isPDF: boolean,
  accessToken: string
): Promise<{
  items: ProcessedItem[];
  total: number;
  storeName: string;
}> {
  try {
    const projectId = Deno.env.get('GOOGLE_PROJECT_ID');
    if (!projectId) {
      throw new Error('Missing GOOGLE_PROJECT_ID environment variable');
    }

    // Use the general OCR processor
    const processorId = 'pretrained-ocr';
    const processorLocation = 'us';

    console.log('Document AI Request:', {
      projectId,
      processorLocation,
      processorId,
      contentType,
      isPDF
    });

    const url = `https://documentai.googleapis.com/v1/projects/${projectId}/locations/${processorLocation}/processors/${processorId}:process`;

    console.log('Making request to Document AI API:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rawDocument: {
          content: base64Image,
          mimeType: contentType,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Document AI API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
    }

    const data = await response.json();
    console.log('Document AI response:', JSON.stringify(data, null, 2));

    const text = data.document.text;
    const lines = text.split('\n');

    // Find store name (usually in the first few lines)
    let storeName = '';
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line && line.length > 2 && !line.match(/^\d/)) {
        storeName = line;
        break;
      }
    }

    // Find items with prices
    const items: ProcessedItem[] = [];
    const priceRegex = /([0-9]+[.,]?[0-9]*)/;
    
    for (const line of lines) {
      const priceMatch = line.match(priceRegex);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(',', ''));
        if (!isNaN(price) && price > 0) {
          // Extract item name (everything before the price)
          let name = line.substring(0, priceMatch.index).trim();
          // Remove any leading numbers or special characters
          name = name.replace(/^[\d\W]+/, '').trim();
          
          if (name) {
            items.push({
              name,
              price,
              quantity: 1
            });
          }
        }
      }
    }

    // Find total amount (looking for specific keywords)
    let total = 0;
    const totalKeywords = ['סה"כ לתשלום', 'סה"כ', 'לתשלום', 'total'];
    
    // Search from bottom to top for total amount
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].toLowerCase();
      if (totalKeywords.some(keyword => line.includes(keyword.toLowerCase()))) {
        const priceMatch = line.match(priceRegex);
        if (priceMatch) {
          total = parseFloat(priceMatch[1].replace(',', ''));
          break;
        }
      }
    }

    console.log('Processed receipt:', {
      storeName,
      itemsCount: items.length,
      total,
      items
    });

    return {
      items,
      total,
      storeName
    };
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}