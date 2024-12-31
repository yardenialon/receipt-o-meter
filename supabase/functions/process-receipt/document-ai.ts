import { DocumentAIResult } from './types.ts';

interface DocumentAIResult {
  items: Array<{ 
    name: string; 
    price: number; 
    quantity?: number;
    product_code?: string;
  }>;
  total: number;
  storeName: string;
}

export async function processDocument(
  base64Image: string, 
  contentType: string, 
  isPDF: boolean,
  accessToken: string
): Promise<DocumentAIResult> {
  const projectId = Deno.env.get('GOOGLE_PROJECT_ID') || '';
  const location = 'us';
  const processorId = '9c913ce7c435a20e';
  
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

  const text = result.document?.text || '';
  console.log('Extracted text:', text);

  const lines = text.split('\n').filter(line => line.trim());
  
  // מילים שמעידות על שם החנות
  const storeIndicators = ['בע"מ', 'חשבונית מס', 'קבלה', 'חשבון', 'עסק מורשה'];
  let storeName = '';
  
  // חיפוש שם החנות בשורות הראשונות
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (storeIndicators.some(indicator => lines[i].includes(indicator))) {
      storeName = lines[i].replace(/(חשבונית מס|קבלה|חשבון|עסק מורשה)/g, '').trim();
      break;
    }
  }
  if (!storeName) storeName = lines[0] || 'חנות לא ידועה';

  const items: Array<{ 
    name: string; 
    price: number; 
    quantity?: number;
    product_code?: string;
  }> = [];
  let total = 0;

  // ביטויים שמעידים על סכום סופי
  const totalIndicators = [
    'סה"כ לתשלום',
    'סה״כ לתשלום',
    'סה"כ',
    'סה״כ',
    'לתשלום',
    'סכום לתשלום',
    'סך הכל לתשלום'
  ];
  
  // מילים שמעידות על פריט
  const itemIndicators = ['קוד', 'מק"ט', 'פריט', 'תאור', 'שם פריט', 'כמות', 'ברקוד'];
  
  // ביטוי רגולרי לזיהוי מחיר - מספר עם אופציה לנקודה עשרונית ואופציה לסימן מטבע
  const priceRegex = /([0-9,]+\.?\d*)\s*(?:₪|ש"ח|שח)?$/;
  
  // ביטוי רגולרי לזיהוי מק"ט/ברקוד - מספרים בתחילת השורה או אחרי המילים מק"ט/קוד/ברקוד
  const productCodeRegex = /(?:^|\b(?:מק"ט|קוד|ברקוד)\s*)(\d{4,})/;

  let foundTotal = false;
  
  // חיפוש הסכום הסופי
  for (const line of lines) {
    // בדיקה אם זו שורת סה"כ
    if (!foundTotal && totalIndicators.some(indicator => line.toLowerCase().includes(indicator.toLowerCase()))) {
      const match = line.match(priceRegex);
      if (match) {
        total = parseFloat(match[1].replace(/,/g, ''));
        foundTotal = true;
        console.log('Found total amount:', total, 'in line:', line);
        continue;
      }
    }

    // זיהוי פריטים רק אם יש מאפיינים של פריט
    if (!storeIndicators.some(indicator => line.includes(indicator)) && 
        !totalIndicators.some(indicator => line.includes(indicator))) {
      
      // בדיקה אם השורה מכילה מאפיין של פריט
      const isItemLine = itemIndicators.some(indicator => line.includes(indicator)) || 
                        /[א-ת]/.test(line); // מכיל אותיות בעברית
      
      if (isItemLine) {
        const priceMatch = line.match(priceRegex);
        if (priceMatch) {
          const price = parseFloat(priceMatch[1].replace(/,/g, ''));
          let name = line
            .replace(priceMatch[0], '') // הסרת המחיר
            .replace(/^\d+\s*/, '') // הסרת מספרים בתחילת השורה (כמו מק"ט)
            .trim();

          // חיפוש מק"ט/ברקוד
          const productCodeMatch = line.match(productCodeRegex);
          const product_code = productCodeMatch ? productCodeMatch[1] : undefined;
          
          // הסרת המק"ט/ברקוד מהשם אם נמצא
          if (product_code) {
            name = name.replace(productCodeMatch[0], '').trim();
          }

          // וידוא שיש שם תקין לפריט ומחיר חיובי
          if (name && !isNaN(price) && price > 0) {
            // חיפוש כמות בשורה
            const quantityMatch = line.match(/x\s*(\d+)/i) || line.match(/כמות:?\s*(\d+)/);
            const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;

            items.push({
              name,
              price,
              quantity,
              product_code
            });
          }
        }
      }
    }
  }

  // אם לא מצאנו סה"כ, ננסה לחפש את המספר האחרון בקבלה שמופיע אחרי אחד מהביטויים
  if (!foundTotal) {
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (totalIndicators.some(indicator => line.includes(indicator))) {
        const match = line.match(priceRegex);
        if (match) {
          total = parseFloat(match[1].replace(/,/g, ''));
          foundTotal = true;
          console.log('Found total amount from bottom search:', total, 'in line:', line);
          break;
        }
      }
    }
  }

  console.log('Parsed results:', {
    storeName,
    itemCount: items.length,
    total,
    items
  });

  return {
    items,
    total,
    storeName
  };
}
