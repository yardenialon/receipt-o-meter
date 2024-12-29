export const validateXMLFile = (file: File) => {
  // Log file details for debugging
  console.log('Validating file:', {
    name: file.name,
    size: file.size,
    type: file.type
  });

  // Check if file exists
  if (!file) {
    throw new Error('לא נבחר קובץ');
  }

  // Check file type
  if (!file.type.includes('xml') && !file.name.toLowerCase().endsWith('.xml')) {
    throw new Error('הקובץ חייב להיות מסוג XML');
  }

  // Check file size (max 100MB)
  const MAX_FILE_SIZE = 100 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('גודל הקובץ חייב להיות קטן מ-100MB');
  }

  return true;
};