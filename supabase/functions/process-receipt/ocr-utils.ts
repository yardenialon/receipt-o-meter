export async function processDocumentAI(base64Image: string, contentType: string, isPDF: boolean): Promise<{
  items: Array<{ name: string; price: number; quantity?: number }>;
  total: number;
  storeName: string;
}> {
  const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT');
  if (!serviceAccountJson) {
    throw new Error('Missing Google Service Account credentials');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  
  // Using the specific project and processor details
  const projectId = serviceAccount.project_id;
  const location = 'us'; // Default to US location
  const processorId = 'pretrained-ocr';

  try {
    console.log('Starting Document AI processing...');
    
    // First, get an access token using the service account
    const jwtHeader = {
      alg: 'RS256',
      typ: 'JWT',
      kid: serviceAccount.private_key_id
    };

    const now = Math.floor(Date.now() / 1000);
    const jwtClaimSet = {
      iss: serviceAccount.client_email,
      sub: serviceAccount.client_email,
      aud: 'https://documentai.googleapis.com/',
      iat: now,
      exp: now + 3600, // Token expires in 1 hour
    };

    // Create JWT
    const encoder = new TextEncoder();
    const headerB64 = btoa(JSON.stringify(jwtHeader));
    const claimSetB64 = btoa(JSON.stringify(jwtClaimSet));
    const signatureInput = `${headerB64}.${claimSetB64}`;
    
    // Sign the JWT
    const key = await crypto.subtle.importKey(
      'pkcs8',
      new TextEncoder().encode(serviceAccount.private_key),
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      key,
      encoder.encode(signatureInput)
    );
    
    const jwt = `${signatureInput}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;

    // Get access token using JWT
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to get access token:', errorText);
      throw new Error('Failed to authenticate with Google Cloud');
    }

    const { access_token } = await tokenResponse.json();
    
    const endpoint = `https://documentai.googleapis.com/v1/projects/${projectId}/locations/${location}/processors/${processorId}:process`;
    
    console.log('Making request to endpoint:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
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
      throw new Error(`שגיאה בזיהוי הקבלה: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Document AI response:', JSON.stringify(result, null, 2));

    // Extract text from the document
    const text = result.document?.text || '';
    console.log('Extracted text:', text);

    // Parse the text into lines and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim());
    
    // Try to find the store name (usually at the top)
    const storeName = lines[0] || 'חנות לא ידועה';
    
    // Look for items and prices
    const items: Array<{ name: string; price: number; quantity?: number }> = [];
    let total = 0;

    // Improved price detection regex for Hebrew receipts
    const priceRegex = /(?:₪|ש"ח|שח)\s*(\d+\.?\d*)|(\d+\.?\d*)\s*(?:₪|ש"ח|שח)/;

    for (const line of lines) {
      const priceMatch = line.match(priceRegex);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1] || priceMatch[2]);
        // Remove the price and currency symbols from the line to get the item name
        const name = line.replace(priceRegex, '').trim();
        
        if (name && price && !isNaN(price)) {
          // Look for quantity patterns (e.g., "2 יח'" or "x2")
          const quantityMatch = name.match(/(\d+)\s*(?:יח'?|×|x)/i);
          const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
          
          const cleanName = name.replace(/\d+\s*(?:יח'?|×|x)/i, '').trim();
          
          items.push({ 
            name: cleanName, 
            price,
            quantity
          });
          total += price * quantity;
        }
      }
    }

    // If no total was found in the regular parsing, use the sum of items
    if (total === 0 && items.length > 0) {
      total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    }

    console.log('Parsed results:', {
      storeName,
      items,
      total
    });

    return {
      items,
      total,
      storeName
    };
  } catch (error) {
    console.error('Error processing document:', error);
    throw new Error(`שגיאה בעיבוד הקבלה: ${error.message}`);
  }
}