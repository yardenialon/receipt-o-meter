import { gunzip } from "https://deno.land/x/compress@v0.4.5/gzip/mod.ts";
import { parse } from 'https://deno.land/x/xml@2.1.1/mod.ts';

export const processFileContent = async (file: File) => {
  const fileContent = await file.arrayBuffer();
  let xmlContent: string;
  
  if (file.name.toLowerCase().endsWith('.gz')) {
    try {
      console.log('Processing GZ file...');
      const decompressed = gunzip(new Uint8Array(fileContent));
      xmlContent = new TextDecoder().decode(decompressed);
    } catch (error) {
      console.error('Error decompressing GZ file:', error);
      throw new Error('קובץ ה-GZ אינו תקין');
    }
  } else {
    console.log('Processing XML file directly...');
    xmlContent = new TextDecoder().decode(fileContent);
  }

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
    console.error('XML Structure:', JSON.stringify(xmlData, null, 2));
    throw new Error('מבנה ה-XML אינו תקין');
  }

  const itemsArray = Array.isArray(items) ? items : [items].filter(Boolean);
  
  if (itemsArray.length === 0) {
    throw new Error('לא נמצאו פריטים בקובץ');
  }

  return itemsArray;
};