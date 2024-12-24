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
  let foundTotal = false;

  // ביטוי רגולרי לזיהוי כמות פריטים
  const itemCountRegex = /כמות פריטים:?\s*(\d+)/i;
  let expectedItemCount = 0;

  // חיפוש כמות פריטים
  for (const line of lines) {
    const countMatch = line.match(itemCountRegex);
    if (countMatch) {
      expectedItemCount = parseInt(countMatch[1]);
      console.log('Expected item count:', expectedItemCount);
      break;
    }
  }

  // ביטוי רגולרי לזיהוי פריטים ומחירים
  const itemRegex = /^([^₪]+?)\s+([\d,]+\.?\d*)\s*(?:₪|ש"ח|שח)?$/;
  
  // ביטוי רגולרי לזיהוי סכום כולל
  const totalRegex = /(?:סה"כ|סה"כ לתשלום|סכום כולל|לתשלום)[:\s]*₪?\s*([\d,]+\.?\d*)/i;

  // עיבוד כל שורה בקבלה
  for (const line of lines) {
    // קודם נבדוק אם זה סכום כולל
    const totalMatch = line.match(totalRegex);
    if (totalMatch && !foundTotal) {
      const totalAmount = parseFloat(totalMatch[1].replace(',', ''));
      if (!isNaN(totalAmount)) {
        total = totalAmount;
        foundTotal = true;
        console.log('Found total amount:', total);
      }
      continue;
    }

    // אם זו לא שורת סיכום, ננסה לזהות פריט
    const itemMatch = line.match(itemRegex);
    if (itemMatch) {
      const [, name, priceStr] = itemMatch;
      const price = parseFloat(priceStr.replace(',', ''));
      
      // נוודא שזה לא מבצע
      if (!line.includes('השבוע במבצע') && !isNaN(price)) {
        items.push({
          name: name.trim(),
          price,
          quantity: 1
        });
        
        // אם לא מצאנו סכום כולל, נחשב אותו
        if (!foundTotal) {
          total += price;
        }
      }
    }
  }

  // אם מצאנו כמות פריטים צפויה, נוודא שזיהינו את כל הפריטים
  if (expectedItemCount > 0 && items.length < expectedItemCount) {
    console.log(`Warning: Found only ${items.length} items out of ${expectedItemCount} expected items`);
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
    expectedItemCount,
    total,
    items
  });

  return {
    items,
    total,
    storeName
  };
}