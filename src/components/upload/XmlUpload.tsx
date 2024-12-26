import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const XmlUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [driveUrl, setDriveUrl] = useState('');

  const parseXmlAndUpload = async (xmlText: string) => {
    try {
      console.log('Starting XML parsing...');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        console.error('XML parsing error:', parserError.textContent);
        throw new Error('קובץ ה-XML אינו תקין. אנא ודא שהקובץ תקין ונסה שוב');
      }

      // Log the XML structure for debugging
      console.log('XML Structure:', xmlDoc.documentElement.outerHTML);

      const items = xmlDoc.getElementsByTagName('Item');
      console.log(`Found ${items.length} items in XML`);
      
      if (items.length === 0) {
        throw new Error('לא נמצאו פריטים בקובץ ה-XML. אנא ודא שהקובץ מכיל תגיות <Item>');
      }

      const products = Array.from(items).map((item, index) => {
        try {
          const product = {
            store_chain: 'שופרסל',
            store_id: '001',
            product_code: item.getElementsByTagName('ItemCode')[0]?.textContent || '',
            product_name: item.getElementsByTagName('ItemName')[0]?.textContent || '',
            manufacturer: item.getElementsByTagName('ManufacturerName')[0]?.textContent || '',
            price: parseFloat(item.getElementsByTagName('ItemPrice')[0]?.textContent || '0'),
            unit_quantity: item.getElementsByTagName('UnitQty')[0]?.textContent || '',
            unit_of_measure: item.getElementsByTagName('UnitMeasure')[0]?.textContent || '',
            category: item.getElementsByTagName('ItemSection')[0]?.textContent || 'אחר',
            price_update_date: new Date().toISOString()
          };

          // Log each product for debugging
          console.log(`Parsing product ${index + 1}:`, product);

          // Validate required fields
          if (!product.product_code || !product.product_name) {
            throw new Error(`מוצר ${index + 1} חסר קוד מוצר או שם מוצר`);
          }

          if (isNaN(product.price) || product.price < 0) {
            throw new Error(`מוצר ${index + 1} מחיר לא תקין: ${product.price}`);
          }

          return product;
        } catch (error) {
          console.error(`Error parsing product ${index + 1}:`, error);
          throw new Error(`שגיאה בפרסור מוצר ${index + 1}: ${error.message}`);
        }
      });

      console.log('Starting batch upload of products...');
      // Batch insert products
      for (let i = 0; i < products.length; i += 100) {
        const batch = products.slice(i, i + 100);
        const { error } = await supabase
          .from('store_products')
          .upsert(batch, { 
            onConflict: 'product_code,store_chain',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error('Error uploading batch:', error);
          throw new Error(`שגיאה בהעלאת קבוצת מוצרים ${i/100 + 1}: ${error.message}`);
        }
        
        console.log(`Uploaded batch ${i/100 + 1} of ${Math.ceil(products.length/100)}`);
        // Show progress toast
        toast.success(`הועלתה קבוצה ${i/100 + 1} מתוך ${Math.ceil(products.length/100)}`);
      }

      return products.length;
    } catch (error) {
      console.error('Error in parseXmlAndUpload:', error);
      throw error;
    }
  };

  const fetchAndProcessGoogleDriveFile = async (url: string) => {
    try {
      // Convert Google Drive view URL to direct download URL
      const fileId = url.match(/\/d\/([^/]+)/)?.[1];
      if (!fileId) {
        throw new Error('כתובת ה-URL אינה תקינה. אנא ודא שזו כתובת שיתוף תקינה של Google Drive');
      }
      
      const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      
      console.log('Fetching file from Google Drive:', directUrl);
      const response = await fetch(directUrl);
      if (!response.ok) {
        throw new Error('שגיאה בהורדת הקובץ מ-Google Drive');
      }
      
      const text = await response.text();
      console.log('File content length:', text.length);
      console.log('First 500 characters of file:', text.substring(0, 500));
      
      const count = await parseXmlAndUpload(text);
      toast.success(`הועלו ${count} מוצרים בהצלחה`);
    } catch (error) {
      console.error('Error processing Google Drive file:', error);
      toast.error('שגיאה בעיבוד הקובץ: ' + (error instanceof Error ? error.message : 'אנא נסה שוב'));
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast.error('לא נבחר קובץ');
      return;
    }

    setIsUploading(true);
    try {
      const file = acceptedFiles[0];
      console.log('Reading file:', file.name);
      
      const text = await file.text();
      console.log('File content length:', text.length);
      console.log('First 500 characters of file:', text.substring(0, 500));
      
      const count = await parseXmlAndUpload(text);
      toast.success(`הועלו ${count} מוצרים בהצלחה`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאת הקובץ: ' + (error instanceof Error ? error.message : 'אנא נסה שוב'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDriveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrl) {
      toast.error('אנא הזן כתובת URL');
      return;
    }

    setIsUploading(true);
    try {
      await fetchAndProcessGoogleDriveFile(driveUrl);
    } finally {
      setIsUploading(false);
      setDriveUrl('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/xml': ['.xml'],
      'application/xml': ['.xml']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <div className="space-y-8">
      <div
        {...getRootProps()}
        className={`
          w-full max-w-xl mx-auto p-8 border-2 border-dashed rounded-xl
          transition-colors duration-200 ease-in-out cursor-pointer
          ${isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-300'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          {isUploading ? (
            <div className="animate-pulse">
              <File className="w-12 h-12 text-primary-500" />
            </div>
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">
              {isDragActive
                ? "שחרר את קובץ ה-XML כאן"
                : "גרור וזרוק את קובץ ה-XML כאן"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              או לחץ לבחירת קובץ
            </p>
            <p className="text-xs text-gray-400 mt-2">
              קבצי XML בלבד
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-grow border-t border-gray-200" />
        <span className="text-sm text-gray-500">או</span>
        <div className="flex-grow border-t border-gray-200" />
      </div>

      <form onSubmit={handleDriveUpload} className="w-full max-w-xl mx-auto space-y-4">
        <div className="flex gap-2">
          <div className="flex-grow">
            <Input
              type="url"
              placeholder="הדבק כתובת URL של קובץ XML מ-Google Drive"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              className="w-full"
              dir="ltr"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isUploading || !driveUrl}
            className="flex items-center gap-2"
          >
            <LinkIcon className="w-4 h-4" />
            העלה מ-Drive
          </Button>
        </div>
      </form>
    </div>
  );
};

export default XmlUpload;