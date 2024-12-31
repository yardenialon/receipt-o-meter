import { ProcessedReceipt, ReceiptItem } from './types';

export async function processReceiptWithDocumentAI(
  imageBytes: Uint8Array,
  fileName: string
): Promise<ProcessedReceipt> {
  const itemIndicators = ['קוד', 'מק"ט', 'פריט', 'תאור', 'שם פריט', 'כמות', 'ברקוד'];
  
  const priceRegex = /([0-9,]+\.?\d*)\s*(?:₪|ש"ח|שח)?$/;
  
  // אופטימיזציה של הביטוי הרגולרי לזיהוי מהיר יותר
  const productCodeRegex = /(?:^|(?:מק"ט|קוד|ברקוד)\s*)(\d{4,})/;

  let foundTotal = false;
  
  const items: ReceiptItem[] = [];
  let total: number | undefined;
  let storeName: string | undefined;

  const processLine = (line: string) => {
    let name = line.trim(); // Initialize name with the trimmed line content

    if (!foundTotal) {
      // חיפוש מק"ט/ברקוד עם הביטוי הרגולרי המשופר
      const productCodeMatch = line.match(productCodeRegex);
      const product_code = productCodeMatch ? productCodeMatch[1] : undefined;
      
      if (product_code) {
        // Remove the product code and any leading text from the name
        name = name.replace(productCodeMatch[0], '').trim();
      }

      // Additional processing logic for the line
      const priceMatch = line.match(priceRegex);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(',', '.'));
        items.push({ name, price, product_code });
      }
    }
  };

  // Logic to read lines from the receipt and process them
  const lines = await getLinesFromImage(imageBytes); // Assume this function exists
  lines.forEach(processLine);

  return {
    items,
    total,
    storeName
  };
}