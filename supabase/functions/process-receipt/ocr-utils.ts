export interface OCRResult {
  items: Array<{ name: string; price: number; quantity?: number }>;
  total: number;
  storeName: string;
}

export async function processOCR(base64Image: string, contentType: string, isPDF: boolean): Promise<OCRResult> {
  console.log('Starting OCR processing with params:', { contentType, isPDF });

  try {
    // Validate API key
    const apiKey = Deno.env.get('OCR_SPACE_API_KEY');
    if (!apiKey) {
      console.error('OCR API key not found');
      throw new Error('חסר מפתח API לשירות זיהוי טקסט');
    }

    console.log('Sending request to OCR.space API...');
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'base64Image': base64Image,
        'language': 'heb,eng', // Using both Hebrew and English for better recognition
        'detectOrientation': 'true',
        'scale': 'true',
        'OCREngine': '2', // Using OCR Engine 2 which has better support for non-Latin scripts
        'isTable': 'true', // Better for receipt format
        'filetype': isPDF ? 'PDF' : contentType.split('/')[1].toUpperCase()
      })
    });

    if (!response.ok) {
      console.error('OCR API response not ok:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('OCR API error response:', errorText);
      throw new Error(`שגיאה בשירות זיהוי טקסט: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('OCR API response:', JSON.stringify(result, null, 2));

    if (result.IsErroredOnProcessing) {
      console.error('OCR processing error:', result.ErrorMessage);
      throw new Error(`שגיאה בעיבוד הקבלה: ${result.ErrorMessage}`);
    }

    if (!result.ParsedResults?.[0]?.ParsedText) {
      console.error('No text found in the image');
      throw new Error('לא זוהה טקסט בתמונה');
    }

    const text = result.ParsedResults[0].ParsedText;
    console.log('Extracted text:', text);

    // Process the text to extract items, total, and store name
    // This is a simplified implementation - you might want to enhance it
    const lines = text.split('\n').filter(line => line.trim());
    const items: Array<{ name: string; price: number; quantity?: number }> = [];
    let total = 0;
    let storeName = '';

    // Try to find store name in first few lines
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      if (lines[i].length > 3 && !lines[i].includes('₪')) {
        storeName = lines[i].trim();
        break;
      }
    }

    // Look for price patterns in the text
    const priceRegex = /(\d+(?:\.\d{2})?)\s*(?:₪|ש"ח|שח)/;
    let maxPrice = 0;

    lines.forEach(line => {
      const match = line.match(priceRegex);
      if (match) {
        const price = parseFloat(match[1]);
        if (price > maxPrice) {
          maxPrice = price;
          total = price; // Assume the highest price is the total
        }
        if (price < total) {
          // Assume this is an item
          const name = line.split(match[0])[0].trim();
          if (name) {
            items.push({ name, price });
          }
        }
      }
    });

    console.log('Processed receipt data:', { storeName, total, itemCount: items.length });
    return { items, total, storeName };
  } catch (error) {
    console.error('Error in OCR processing:', error);
    throw new Error(`שגיאה בעיבוד הקבלה: ${error.message}`);
  }
}