
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export const ProductsHeader = () => {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // יצירת שם קובץ ייחודי
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        
        // העלאת הקובץ לסטורג'
        const { error: uploadError } = await supabase.storage
          .from('product_images')
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        // שמירת המידע בטבלת product_images
        const { error: dbError } = await supabase
          .from('product_images')
          .insert({
            image_path: fileName,
            product_code: 'manual_upload',
            product_name: file.name.split('.')[0],
            status: 'active'
          });

        if (dbError) {
          throw dbError;
        }

        return fileName;
      });

      await Promise.all(uploadPromises);
      
      toast.success(`הועלו בהצלחה ${files.length} תמונות!`);
      
      // איפוס הקלט
      event.target.value = '';
      
    } catch (error) {
      console.error('שגיאה בהעלאת תמונות:', error);
      toast.error('שגיאה בהעלאת התמונות. נסה שוב.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ShoppingCart className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">מוצרים</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="product-images-upload"
        />
        <label htmlFor="product-images-upload">
          <Button
            variant="outline"
            className="gap-2 cursor-pointer"
            disabled={uploading}
            asChild
          >
            <span>
              {uploading ? (
                <>
                  <Upload className="h-4 w-4 animate-spin" />
                  מעלה תמונות...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  העלה תמונות
                </>
              )}
            </span>
          </Button>
        </label>
        
        <div className="text-sm text-gray-500">
          <span>מציג מוצרים מכל הרשתות</span>
        </div>
      </div>
    </div>
  );
};
