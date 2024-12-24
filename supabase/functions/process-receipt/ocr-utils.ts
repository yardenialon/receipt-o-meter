import { getGoogleAccessToken } from './auth-utils.ts';
import { processDocument } from './document-ai.ts';

export async function processDocumentAI(
  base64Image: string, 
  contentType: string, 
  isPDF: boolean
): Promise<{
  items: Array<{ name: string; price: number; quantity?: number }>;
  total: number;
  storeName: string;
}> {
  try {
    console.log('Starting Document AI processing...');
    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT');
    
    // Get access token for Google Cloud API
    const accessToken = await getGoogleAccessToken(serviceAccountJson);
    
    // Process the document using Document AI
    return await processDocument(base64Image, contentType, isPDF, accessToken);
  } catch (error) {
    console.error('Error in Document AI processing:', error);
    throw error;
  }
}