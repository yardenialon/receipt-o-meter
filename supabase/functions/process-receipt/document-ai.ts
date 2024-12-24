import { DocumentAIResult } from './types.ts';

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

  const items: Array<{ name: string; price: number; quantity?: number }> = [];
  let total = 0;

  // ביטוי רגולרי משופר לזיהוי פריטים ומחירים
  // מזהה שורות שמתחילות במספר (מחיר) ומכילות טקסט בעברית
  const itemRegex = /^(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+)\s+(.+?)(?:\s+\d+\.?\d*)?$/;
  
  // עיבוד כל שורה בקבלה
  for (const line of lines) {
    const itemMatch = line.match(itemRegex);
    if (itemMatch) {
      const [, unitPrice, totalPrice, quantity, name] = itemMatch;
      const price = parseFloat(totalPrice);
      
      if (!isNaN(price)) {
        items.push({
          name: name.trim(),
          price,
          quantity: parseInt(quantity)
        });
        total += price;
      }
    }
  }

  // אם לא מצאנו פריטים, ננסה לחפש בפורמט אחר
  if (items.length === 0) {
    const simpleItemRegex = /^(.+?)\s+([\d,]+\.?\d*)\s*(?:₪|ש"ח|שח)?$/;
    for (const line of lines) {
      const itemMatch = line.match(simpleItemRegex);
      if (itemMatch) {
        const [, name, priceStr] = itemMatch;
        const price = parseFloat(priceStr.replace(',', ''));
        
        if (!isNaN(price)) {
          items.push({
            name: name.trim(),
            price,
            quantity: 1
          });
          total += price;
        }
      }
    }
  }

  // אם לא מצאנו פריטים, נחזיר הודעת שגיאה מתאימה
  if (items.length === 0) {
    console.log('No items found in receipt');
    return {
      items: [],
      total: 0,
      storeName: 'לא זוהו פריטים'
    };
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