export const getGoogleDriveDirectUrl = (url: string): string => {
  console.log('Processing Drive URL:', url);
  const fileId = url.match(/\/d\/([^/]+)/)?.[1];
  if (!fileId) {
    console.error('Invalid Drive URL format');
    throw new Error('כתובת ה-URL אינה תקינה. אנא ודא שזו כתובת שיתוף תקינה של Google Drive');
  }
  console.log('Extracted file ID:', fileId);
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

export const fetchGoogleDriveFile = async (url: string): Promise<string> => {
  try {
    const directUrl = getGoogleDriveDirectUrl(url);
    console.log('Fetching file from Google Drive:', directUrl);
    
    const response = await fetch(directUrl);
    if (!response.ok) {
      console.error('Google Drive response:', response.status, response.statusText);
      throw new Error(`שגיאה בהורדת הקובץ מ-Google Drive (${response.status}). אנא ודא שהקובץ נגיש וזמין`);
    }
    
    const text = await response.text();
    console.log('File content length:', text.length);
    
    if (text.includes('<!DOCTYPE html>')) {
      console.error('Received HTML instead of XML');
      throw new Error('לא ניתן לגשת לקובץ. אנא ודא שהקובץ משותף לצפייה לכל מי שיש לו את הקישור');
    }
    
    return text;
  } catch (error) {
    console.error('Error fetching from Google Drive:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('לא ניתן להתחבר ל-Google Drive. אנא בדוק את החיבור לאינטרנט ונסה שוב');
    }
    throw error;
  }
};