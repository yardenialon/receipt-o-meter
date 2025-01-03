import { gunzip } from "https://deno.land/x/compress@v0.4.5/gzip/mod.ts";
import { parse } from 'https://deno.land/x/xml@2.1.1/mod.ts';

export const processFileContent = async (file: File) => {
  console.log('Processing file:', {
    name: file.name,
    type: file.type,
    size: file.size
  });

  const fileContent = await file.arrayBuffer();
  let xmlContent: string;
  
  if (file.name.toLowerCase().endsWith('.gz')) {
    try {
      console.log('Attempting to decompress GZ file...');
      const fileBytes = new Uint8Array(fileContent);
      
      // Check if the file starts with the GZ magic number (1f 8b)
      if (fileBytes.length < 2 || fileBytes[0] !== 0x1f || fileBytes[1] !== 0x8b) {
        console.error('Invalid GZ file header:', {
          length: fileBytes.length,
          firstBytes: fileBytes.slice(0, 2)
        });
        throw new Error('הקובץ אינו בפורמט GZ תקין');
      }

      try {
        const decompressed = gunzip(fileBytes);
        xmlContent = new TextDecoder().decode(decompressed);
        console.log('Successfully decompressed GZ file, content length:', xmlContent.length);
      } catch (decompressError) {
        console.error('Error during GZ decompression:', decompressError);
        throw new Error('שגיאה בפענוח קובץ ה-GZ: הקובץ פגום או לא תקין');
      }
    } catch (error) {
      console.error('Error processing GZ file:', error);
      throw error instanceof Error ? error : new Error('שגיאה לא ידועה בעיבוד קובץ ה-GZ');
    }
  } else if (file.name.toLowerCase().endsWith('.xml')) {
    console.log('Processing XML file directly...');
    xmlContent = new TextDecoder().decode(fileContent);
  } else {
    throw new Error('הקובץ חייב להיות בפורמט XML או GZ');
  }

  try {
    console.log('Parsing XML content...');
    const xmlData = parse(xmlContent);
    
    if (!xmlData) {
      throw new Error('שגיאה בפענוח קובץ ה-XML');
    }

    let items;
    if (xmlData?.root?.Items?.Item) {
      items = xmlData.root.Items.Item;
    } else if (xmlData?.Items?.Item) {
      items = xmlData.Items.Item;
    } else {
      console.error('Invalid XML Structure:', JSON.stringify(xmlData, null, 2));
      throw new Error('מבנה ה-XML אינו תקין');
    }

    const itemsArray = Array.isArray(items) ? items : [items].filter(Boolean);
    
    if (itemsArray.length === 0) {
      throw new Error('לא נמצאו פריטים בקובץ');
    }

    console.log(`Successfully parsed ${itemsArray.length} items from XML`);
    return itemsArray;
  } catch (error) {
    console.error('Error parsing XML content:', error);
    throw new Error(`שגיאה בפענוח תוכן ה-XML: ${error.message}`);
  }
};