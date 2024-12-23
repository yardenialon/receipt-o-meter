export interface OCRResult {
  items: Array<{ name: string; price: number; quantity?: number }>;
  total: number;
  storeName: string;
}

export async function processOCR(imageBase64: string, fileType: string): Promise<OCRResult> {
  try {
    console.log('Starting OCR processing with content type:', fileType);
    
    // Process base64 format
    const base64Image = imageBase64.includes('base64,') ? 
      imageBase64 : 
      `data:${fileType};base64,${imageBase64}`;

    console.log('Making OCR API request with Hebrew language settings...');
    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': Deno.env.get('OCR_SPACE_API_KEY') ?? '',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'base64Image': base64Image,
        'language': 'heb', // Hebrew language
        'detectOrientation': 'true',
        'scale': 'true',
        'OCREngine': '2', // More advanced OCR engine
        'isTable': 'true',
        'filetype': fileType === 'application/pdf' ? 'PDF' : 'Auto',
        'isOverlayRequired': 'false',
        'IsCreateSearchablePDF': 'false',
        'isSearchablePdfHideTextLayer': 'false',
        'detectCheckbox': 'false',
        'checkboxTemplate': '0',
        'pageRange': 'all'
      }),
    });

    if (!ocrResponse.ok) {
      const errorText = await ocrResponse.text();
      console.error('OCR API error response:', errorText);
      throw new Error('שגיאה בתקשורת עם שירות ה-OCR - אנא נסה שוב');
    }

    const ocrResult = await ocrResponse.json();
    console.log('OCR API raw response:', JSON.stringify(ocrResult));

    if (!ocrResult.ParsedResults?.[0]?.ParsedText) {
      console.error('No parsed text in OCR result:', ocrResult);
      
      // Check if there's a specific error from the OCR service
      if (ocrResult.ErrorMessage) {
        console.error('OCR service error:', ocrResult.ErrorMessage);
        throw new Error(`שגיאה מהשירות: ${ocrResult.ErrorMessage}`);
      }
      
      if (ocrResult.IsErroredOnProcessing) {
        console.error('OCR processing error:', ocrResult.ErrorDetails);
        throw new Error('שגיאה בעיבוד התמונה - אנא נסה שוב');
      }
      
      throw new Error('לא זוהה טקסט בקבלה - אנא נסה להעלות תמונה ברורה יותר');
    }

    const parsedText = ocrResult.ParsedResults[0].ParsedText;
    console.log('Extracted text:', parsedText);

    // Parse the OCR text into structured data
    const lines = parsedText.split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());

    console.log('Parsed lines:', lines);

    const items: Array<{ name: string; price: number; quantity?: number }> = [];
    let total = 0;
    let storeName = '';

    // Enhanced store name detection - look for longer text lines in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (line && line.length > 3 && !/^\d/.test(line) && !/^[A-Za-z]/.test(line)) {
        storeName = line;
        break;
      }
    }

    // Improved price and item detection
    const pricePattern = /(\d+\.?\d*)/;
    const quantityPattern = /[xX×](\d+)|(\d+)\s*יח\'?/; // Added Hebrew unit indicator
    const skipWords = [
      'סהכ', 'מעמ', 'שקל', 'תשלום', 'מזומן', 'אשראי', 'כרטיס', 'עודף', 'מספר',
      'חשבונית', 'קבלה', 'עוסק', 'מורשה', 'טלפון', 'פקס', 'תאריך'
    ];
    
    for (const line of lines) {
      // Skip lines containing specific words
      if (skipWords.some(word => line.includes(word))) {
        console.log('Skipping line with reserved word:', line);
        continue;
      }

      const priceMatch = line.match(pricePattern);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1]);
        if (!isNaN(price) && price > 0) {
          // Clean item name by removing price and special characters
          let name = line
            .replace(priceMatch[0], '')
            .replace(/[^\w\s\u0590-\u05FF]/g, ' ') // Keep Hebrew characters
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();

          // Check for quantity
          let quantity: number | undefined;
          const quantityMatch = line.match(quantityPattern);
          if (quantityMatch) {
            quantity = parseInt(quantityMatch[1] || quantityMatch[2]);
            name = name.replace(quantityMatch[0], '').trim();
          }

          if (name && price > 0 && !/^\d+$/.test(name)) {
            console.log('Found item:', { name, price, quantity });
            items.push({ name, price, ...(quantity && { quantity }) });
            total += price * (quantity || 1);
          }
        }
      }
    }

    console.log('Parsed items:', items);
    console.log('Total:', total);
    console.log('Store name:', storeName);

    if (items.length === 0) {
      throw new Error('לא זוהו פריטים בקבלה - אנא נסה להעלות תמונה ברורה יותר');
    }

    return { items, total, storeName };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw error;
  }
}