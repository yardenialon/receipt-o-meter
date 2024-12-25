import { processWithVeryfi } from './veryfi.ts';

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
    console.log('Starting Veryfi processing...');
    return await processWithVeryfi(base64Image, contentType, isPDF);
  } catch (error) {
    console.error('Error in Veryfi processing:', error);
    throw error;
  }
}