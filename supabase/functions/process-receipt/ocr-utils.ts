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
    console.log('Starting Veryfi processing...', {
      contentType,
      isPDF,
      imageSize: base64Image.length
    });
    
    const result = await processWithVeryfi(base64Image, contentType, isPDF);
    
    console.log('Veryfi processing completed successfully:', {
      itemsCount: result.items.length,
      total: result.total,
      storeName: result.storeName
    });
    
    return result;
  } catch (error) {
    console.error('Error in Veryfi processing:', error);
    throw error;
  }
}