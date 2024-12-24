interface OCRResult {
  items: Array<{ name: string; price: number; quantity?: number }>;
  total: number;
  storeName: string;
}

async function detectText(imageBytes: string): Promise<string[]> {
  const apiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
  if (!apiKey) {
    throw new Error('Missing Google Cloud API key');
  }

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: imageBytes,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                model: 'builtin/latest',
              },
            ],
            imageContext: {
              languageHints: ['he', 'en'],
            },
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Google Vision API error:', error);
    throw new Error(`שגיאה בזיהוי טקסט: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.responses?.[0]?.textAnnotations?.[0]?.description) {
    throw new Error('לא זוהה טקסט בתמונה');
  }

  return result.responses[0].textAnnotations[0].description.split('\n');
}

export async function processOCR(
  base64Image: string,
  contentType: string,
  isPDF: boolean
): Promise<OCRResult> {
  console.log('Starting OCR processing with params:', { contentType, isPDF });

  try {
    const textLines = await detectText(base64Image);
    console.log('Extracted text lines:', textLines);

    // Process the text to extract items, total, and store name
    const items: Array<{ name: string; price: number; quantity?: number }> = [];
    let total = 0;
    let storeName = '';

    // Try to find store name in first few lines
    for (let i = 0; i < Math.min(3, textLines.length); i++) {
      if (textLines[i].length > 3 && !/[₪0-9]/.test(textLines[i])) {
        storeName = textLines[i].trim();
        break;
      }
    }

    // Look for price patterns in the text
    const priceRegex = /(\d+(?:\.\d{2})?)\s*(?:₪|ש"ח|שח)/;
    let maxPrice = 0;

    textLines.forEach((line) => {
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
          if (name && name.length > 1) {
            items.push({ name, price });
          }
        }
      }
    });

    console.log('Processed receipt data:', {
      storeName,
      total,
      itemCount: items.length,
    });

    return { items, total, storeName };
  } catch (error) {
    console.error('Error in OCR processing:', error);
    throw new Error(`שגיאה בעיבוד הקבלה: ${error.message}`);
  }
}