interface VeryfiLineItem {
  description: string;
  total: number;
  quantity?: number;
  sku?: string;
}

interface VeryfiResponse {
  line_items: VeryfiLineItem[];
  total: number;
  subtotal?: number;
  tax?: number;
  vendor?: {
    name?: string;
  };
}

export async function processWithVeryfi(
  base64Image: string,
  contentType: string,
  isPDF: boolean
) {
  const clientId = Deno.env.get('VERYFI_CLIENT_ID');
  const clientSecret = Deno.env.get('VERYFI_CLIENT_SECRET');
  const username = Deno.env.get('VERYFI_USERNAME');
  const apiKey = Deno.env.get('VERYFI_API_KEY');

  if (!clientId || !clientSecret || !username || !apiKey) {
    throw new Error('Missing Veryfi credentials');
  }

  console.log('Processing document with Veryfi...');

  const response = await fetch('https://api.veryfi.com/api/v8/partner/documents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Client-Id': clientId,
      'Authorization': `apikey ${username}:${apiKey}`,
    },
    body: JSON.stringify({
      file_data: base64Image,
      file_name: `receipt.${isPDF ? 'pdf' : 'jpg'}`,
      categories: ['Grocery', 'Utilities', 'Supplies'],
      auto_delete: true,
      boost_mode: true, // מפעיל מצב מדויק יותר
      ocr_engine: 2, // משתמש במנוע OCR מתקדם יותר
      external_id: `receipt_${Date.now()}`,
      max_pages_to_process: 1,
      parameters: {
        // הגדרות ספציפיות לזיהוי קבלות ישראליות
        receipt_number_prefix: ['מספר קבלה', 'מס קבלה', 'קבלה מס'],
        total_amount_keywords: ['סה"כ לתשלום', 'סה״כ', 'לתשלום', 'סכום כולל', 'Total'],
        ignore_amount_keywords: ['מע"מ', 'פטור ממע"מ', 'חייב מע"מ', 'VAT', 'Tax'],
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Veryfi API error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`Error processing document: ${response.status} ${response.statusText}`);
  }

  const result: VeryfiResponse = await response.json();
  console.log('Veryfi response received:', result);

  // מנסה לזהות את הסכום הכולל האמיתי
  let finalTotal = result.total;
  
  // אם יש subtotal וגם tax, נוודא שה-total הוא אכן הסכום של שניהם
  if (result.subtotal && result.tax) {
    const calculatedTotal = result.subtotal + result.tax;
    // אם יש הבדל קטן (עד 1 שקל), נשתמש בסכום המחושב
    if (Math.abs(calculatedTotal - result.total) <= 1) {
      finalTotal = calculatedTotal;
    }
  }

  // בדיקה שהסכום הכולל הגיוני ביחס לסכום הפריטים
  const itemsTotal = result.line_items.reduce((sum, item) => sum + item.total, 0);
  if (Math.abs(itemsTotal - finalTotal) > itemsTotal * 0.5) {
    console.warn('Total amount seems incorrect, using items total instead', {
      originalTotal: finalTotal,
      itemsTotal: itemsTotal
    });
    finalTotal = itemsTotal;
  }

  return {
    items: result.line_items.map(item => ({
      name: item.description,
      price: item.total,
      quantity: item.quantity || 1,
      product_code: item.sku || undefined
    })),
    total: finalTotal,
    storeName: result.vendor?.name || 'חנות לא ידועה'
  };
}