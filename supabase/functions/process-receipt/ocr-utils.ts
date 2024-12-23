export interface OCRResult {
  items: Array<{ name: string; price: number }>;
  total: number;
  storeName: string;
}

export async function processOCR(imageBase64: string, fileType: string): Promise<OCRResult> {
  try {
    console.log('Starting OCR processing...');
    console.log('Content type:', fileType);
    
    // Split base64 into smaller chunks to avoid memory issues
    const chunkSize = 500000; // 500KB chunks
    const chunks = [];
    for (let i = 0; i < imageBase64.length; i += chunkSize) {
      chunks.push(imageBase64.slice(i, i + chunkSize));
    }
    console.log(`Split image into ${chunks.length} chunks`);

    // Process base64 format
    const base64Image = imageBase64.includes('base64,') ? 
      imageBase64 : 
      `data:${fileType};base64,${imageBase64}`;

    console.log('Making OCR API request...');
    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': Deno.env.get('OCR_SPACE_API_KEY') ?? '',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'base64Image': base64Image,
        'language': 'heb',
        'detectOrientation': 'true',
        'scale': 'true',
        'OCREngine': '2',
        'isTable': 'true',
        'filetype': fileType === 'application/pdf' ? 'PDF' : 'Auto',
        'isOverlayRequired': 'false',
      }),
    });

    if (!ocrResponse.ok) {
      const errorText = await ocrResponse.text();
      console.error('OCR API error response:', errorText);
      throw new Error(`OCR API request failed with status ${ocrResponse.status}`);
    }

    // Stream the response to avoid memory issues
    const reader = ocrResponse.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    let result = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += new TextDecoder().decode(value);
    }

    const ocrResult = JSON.parse(result);
    console.log('OCR API response received');

    if (!ocrResult.ParsedResults?.[0]?.ParsedText) {
      console.error('No parsed text in OCR result');
      throw new Error('No text extracted from image');
    }

    const parsedText = ocrResult.ParsedResults[0].ParsedText;
    console.log('Extracted text length:', parsedText.length);

    // Parse the OCR text into structured data
    const lines = parsedText.split('\n').filter(line => line.trim());
    const items: Array<{ name: string; price: number }> = [];
    let total = 0;
    let storeName = '';

    // Find store name in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line && line.length > 2 && !line.match(/^\d/)) {
        storeName = line;
        break;
      }
    }

    // Process lines to find items and prices
    const pricePattern = /(\d+\.?\d*)/;
    const skipWords = ['סהכ', 'מעמ', 'שקל', 'תשלום', 'מזומן', 'אשראי'];
    
    for (const line of lines) {
      // Skip lines containing specific words
      if (skipWords.some(word => line.includes(word))) continue;

      const priceMatch = line.match(pricePattern);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1]);
        if (!isNaN(price) && price > 0) {
          const name = line
            .replace(priceMatch[0], '')
            .replace(/[^\w\s\u0590-\u05FF]/g, '')
            .trim();

          if (name && price > 0 && !name.match(/^[\d\s]+$/)) {
            items.push({ name, price });
            total += price;
          }
        }
      }
    }

    console.log('Parsed items:', items.length);
    console.log('Total:', total);
    console.log('Store name:', storeName);

    return { items, total, storeName };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw error;
  }
}