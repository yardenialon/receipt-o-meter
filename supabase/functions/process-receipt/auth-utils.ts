export async function getGoogleAccessToken(serviceAccountJson: string): Promise<string> {
  if (!serviceAccountJson) {
    throw new Error('Missing Google Service Account credentials');
  }

  console.log('Attempting to parse service account credentials...');
  
  let serviceAccount;
  try {
    // Try parsing with different methods
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
      console.log('Successfully parsed service account JSON directly');
    } catch {
      // If direct parsing fails, try cleaning the string
      const cleanedJson = serviceAccountJson
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\/g, '')
        .replace(/"{/g, '{')
        .replace(/}"/g, '}');
      
      console.log('Attempting to parse cleaned JSON...');
      serviceAccount = JSON.parse(cleanedJson);
      console.log('Successfully parsed service account JSON after cleaning');
    }
  } catch (error) {
    console.error('Failed to parse service account JSON:', error);
    throw new Error('Invalid service account format. Please check the credentials format in Supabase secrets.');
  }

  // Validate required fields
  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    console.error('Service account missing required fields');
    throw new Error('Invalid service account - missing required fields');
  }

  console.log('Creating JWT for authentication...');
  const now = Math.floor(Date.now() / 1000);
  const jwtHeader = {
    alg: 'RS256',
    typ: 'JWT',
    kid: serviceAccount.private_key_id
  };

  const jwtClaimSet = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-platform'
  };

  // Create JWT
  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(jwtHeader));
  const claimSetB64 = btoa(JSON.stringify(jwtClaimSet));
  const signatureInput = `${headerB64}.${claimSetB64}`;

  try {
    // Convert PEM to DER format
    const pemHeader = '-----BEGIN PRIVATE KEY-----';
    const pemFooter = '-----END PRIVATE KEY-----';
    const pemContents = serviceAccount.private_key
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '');
    
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

    // Import the key
    const key = await crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
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

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
    const jwt = `${signatureInput}.${signatureB64}`;

    console.log('Successfully created JWT, requesting access token...');

    // Get access token
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
    console.log('Successfully obtained access token');
    return access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new Error(`Failed to authenticate with Google Cloud: ${error.message}`);
  }
}