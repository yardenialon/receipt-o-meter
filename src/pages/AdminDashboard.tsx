import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductImagesBulkUpload } from '@/components/products/ProductImagesBulkUpload';
import { ProductImageUpload } from '@/components/products/ProductImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Image, FileText, Database } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const AdminDashboard = () => {
  const [singleProductCode, setSingleProductCode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSingleImageUpload = async () => {
    if (!singleProductCode || !imageUrl) {
      toast.error('אנא מלא את כל השדות');
      return;
    }

    setUploading(true);
    try {
      // Download image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('לא ניתן להוריד את התמונה');
      }
      
      const blob = await response.blob();
      const file = new File([blob], `${singleProductCode}.jpg`, { type: 'image/jpeg' });
      
      // Upload to storage
      const fileName = `${singleProductCode}_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product_images')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('product_images')
        .upsert({
          product_code: singleProductCode,
          image_path: uploadData.path,
          is_primary: true
        });

      if (dbError) {
        throw dbError;
      }

      toast.success('התמונה הועלתה בהצלחה');
      setSingleProductCode('');
      setImageUrl('');
    } catch (error) {
      console.error('שגיאה בהעלאת תמונה:', error);
      toast.error('שגיאה בהעלאת התמונה');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">דשבורד מנהל</h1>
      </div>

      <Tabs defaultValue="bulk-upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bulk-upload" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            העלאה בכמויות (CSV)
          </TabsTrigger>
          <TabsTrigger value="single-upload" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            תמונה יחידה
          </TabsTrigger>
          <TabsTrigger value="file-upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            העלאת קובץ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bulk-upload" className="space-y-4">
          <ProductImagesBulkUpload />
        </TabsContent>

        <TabsContent value="single-upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                העלאת תמונה יחידה
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productCode">מק"ט מוצר</Label>
                  <Input
                    id="productCode"
                    value={singleProductCode}
                    onChange={(e) => setSingleProductCode(e.target.value)}
                    placeholder="הכנס מקט מוצר"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL תמונה</Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <Button 
                onClick={handleSingleImageUpload}
                disabled={!singleProductCode || !imageUrl || uploading}
                className="w-full"
              >
                {uploading ? 'מעלה...' : 'העלה תמונה'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="file-upload" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>העלאת תמונה לפי מק"ט</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductImageUpload 
                  productCode={singleProductCode}
                  onSuccess={() => toast.success('התמונה הועלתה בהצלחה')}
                />
                <div className="mt-4">
                  <Label htmlFor="productCodeForFile">מק"ט מוצר</Label>
                  <Input
                    id="productCodeForFile"
                    value={singleProductCode}
                    onChange={(e) => setSingleProductCode(e.target.value)}
                    placeholder="הכנס מקט מוצר"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>הוראות שימוש</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">העלאה בכמויות (CSV):</h4>
                  <p className="text-sm text-blue-700">
                    העלה קובץ CSV עם עמודות: SKU, Product Name, Image URL
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">תמונה יחידה:</h4>
                  <p className="text-sm text-green-700">
                    הכנס מק"ט וקישור לתמונה להעלאה מהירה
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">העלאת קובץ:</h4>
                  <p className="text-sm text-purple-700">
                    גרור ושחרר קבצי תמונה עם מק"ט מוצר
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};