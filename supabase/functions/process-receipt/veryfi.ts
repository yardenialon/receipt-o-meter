interface VeryfiLineItem {
  description: string;
  total: number;
  quantity?: number;
}

interface VeryfiResponse {
  line_items: VeryfiLineItem[];
  total: number;
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

  return {
    items: result.line_items.map(item => ({
      name: item.description,
      price: item.total,
      quantity: item.quantity || 1
    })),
    total: result.total,
    storeName: result.vendor?.name || 'חנות לא ידועה'
  };
}