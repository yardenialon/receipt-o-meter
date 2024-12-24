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

  // מילים שמעידות על פריט
  const itemIndicators = ['יח\'', 'כמות', '@', 'X', 'x', '*'];
  // מילים שלא יכולות להיות בפריט
  const nonItemWords = ['סה"כ', 'מע"מ', 'הנחה', 'משלוח', 'אשראי', 'מזומן', 'שולם', 'עודף'];
  
  const items: Array<{ name: string; price: number; quantity?: number }> = [];
  let total = 0;

  // חיפוש מתקדם של מחירים
  const priceRegex = /(?:₪|ש"ח|שח)\s*(-?\d+\.?\d*)|(-?\d+\.?\d*)\s*(?:₪|ש"ח|שח)/;
  const quantityRegex = /(\d+(?:\.\d+)?)\s*(?:יח'?|×|x|\*)/i;
  
  // מילים שמעידות על שורת סיכום
  const totalIndicators = [
    'סה"כ לתשלום',
    'סה"כ',
    'סהכ',
    'סך הכל',
    'לתשלום',
    'total',
    'סכום כולל',
    'שולם'
  ];

  let foundTotal = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // דלג על שורות ריקות או קצרות מדי
    if (line.length < 2) continue;
    
    // בדוק אם זו שורת סיכום
    const isTotalLine = totalIndicators.some(indicator => 
      line.toLowerCase().includes(indicator.toLowerCase())
    );
    
    const priceMatch = line.match(priceRegex);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1] || priceMatch[2]);
      
      // אם זו שורת סיכום, עדכן את הסכום הכולל
      if (isTotalLine) {
        if (!isNaN(price)) {
          total = Math.abs(price);
          foundTotal = true;
        }
        continue;
      }
      
      // נקה את השם מהמחיר ומסימני המטבע
      let name = line.replace(priceRegex, '').trim();
      name = name.replace(/₪|ש"ח|שח/g, '').trim();
      
      // בדוק אם השורה מכילה מילים שמעידות על פריט או לא מכילה מילים שלא יכולות להיות בפריט
      const isLikelyItem = itemIndicators.some(indicator => line.includes(indicator)) ||
                          !nonItemWords.some(word => line.toLowerCase().includes(word.toLowerCase()));
      
      if (name && !isNaN(price) && isLikelyItem) {
        const quantityMatch = line.match(quantityRegex);
        const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : 1;
        
        // נקה את הכמות מהשם
        name = name.replace(quantityRegex, '').trim();
        
        // הוסף רק אם יש שם ומחיר תקינים
        if (name.length > 0 && Math.abs(price) > 0) {
          items.push({ 
            name, 
            price: Math.abs(price),
            quantity
          });
        }
      }
    }
  }

  // אם לא מצאנו סכום כולל, נחשב אותו מסכום הפריטים
  if (!foundTotal && items.length > 0) {
    total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
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