import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const XmlUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const parseXmlAndUpload = async (xmlText: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const items = xmlDoc.getElementsByTagName('Item');
    
    const products = Array.from(items).map(item => ({
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
    }));

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
        throw error;
      }
    }

    return products.length;
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const file = acceptedFiles[0];
      const text = await file.text();
      const count = await parseXmlAndUpload(text);
      toast.success(`הועלו ${count} מוצרים בהצלחה`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאת הקובץ: ' + (error instanceof Error ? error.message : 'אנא נסה שוב'));
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/xml': ['.xml'],
      'application/xml': ['.xml']
    },
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      className={`
        w-full max-w-xl mx-auto mt-8 p-8 border-2 border-dashed rounded-xl
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
  );
};

export default XmlUpload;