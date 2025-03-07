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
    display_name?: string;
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

  console.log('Processing document with Veryfi...', {
    contentType,
    isPDF,
    imageSize: base64Image.length
  });

  try {
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
        boost_mode: true,
        external_id: `receipt_${Date.now()}`,
        max_pages_to_process: 1,
        tags: ['לתשלום', 'סה"כ לתשלום', 'סה״כ', 'סכום כולל', 'Total', 'סה"כ כולל מע"מ']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Veryfi API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Error processing document: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result: VeryfiResponse = await response.json();
    console.log('Veryfi response received:', {
      hasLineItems: !!result.line_items?.length,
      total: result.total,
      subtotal: result.subtotal,
      tax: result.tax,
      vendorName: result.vendor?.name,
      vendorDisplayName: result.vendor?.display_name
    });

    if (!result.line_items || !Array.isArray(result.line_items)) {
      console.error('Invalid response format - missing line items:', result);
      throw new Error('Invalid response format from Veryfi API');
    }

    // Calculate the total from line items
    const itemsTotal = result.line_items.reduce((sum, item) => {
      const itemTotal = typeof item.total === 'number' ? item.total : 0;
      return sum + itemTotal;
    }, 0);

    // Use the most reliable total amount
    let finalTotal = result.total;

    // If we have subtotal and tax, verify the total
    if (typeof result.subtotal === 'number' && typeof result.tax === 'number') {
      const calculatedTotal = result.subtotal + result.tax;
      if (Math.abs(calculatedTotal - result.total) <= 1) {
        finalTotal = calculatedTotal;
      }
    }

    // Validate the final total against items total
    if (Math.abs(itemsTotal - finalTotal) > itemsTotal * 0.5) {
      console.warn('Total amount validation failed, using items total:', {
        originalTotal: finalTotal,
        itemsTotal: itemsTotal,
        difference: Math.abs(itemsTotal - finalTotal)
      });
      finalTotal = itemsTotal;
    }

    // Ensure we have a valid total
    if (typeof finalTotal !== 'number' || isNaN(finalTotal)) {
      console.error('Invalid total amount:', finalTotal);
      finalTotal = itemsTotal; // Fallback to items total
    }

    // Get the store name from either display_name or name, with a fallback
    const storeName = result.vendor?.display_name || result.vendor?.name || 'חנות לא ידועה';
    console.log('Detected store name:', storeName);

    return {
      items: result.line_items.map(item => ({
        name: item.description || 'פריט לא ידוע',
        price: typeof item.total === 'number' ? item.total : 0,
        quantity: typeof item.quantity === 'number' ? item.quantity : 1,
        product_code: item.sku
      })),
      total: Math.max(0, finalTotal), // Ensure non-negative total
      storeName: storeName
    };
  } catch (error) {
    console.error('Error in Veryfi processing:', error);
    throw error;
  }
}