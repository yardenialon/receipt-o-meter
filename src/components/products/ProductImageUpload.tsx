
import { useState } from 'react';
import { toast } from 'sonner';
import { Image, Upload, Loader2 } from 'lucide-react';
import { useProductImageUpload } from '@/hooks/useProductImageUpload';
import DropZone from '@/components/upload/DropZone';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface ProductImageUploadProps {
  productCode: string;
  onSuccess?: () => void;
}

export const ProductImageUpload = ({ productCode, onSuccess }: ProductImageUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isUploading, uploadProductImage } = useProductImageUpload();
  
  const handleFileDrop = async (file: Blob) => {
    if (!(file instanceof File)) {
      toast.error('קובץ לא תקין');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('אנא העלה קובץ תמונה בלבד');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('גודל התמונה חייב להיות קטן מ-5MB');
      return;
    }
    
    try {
      const result = await uploadProductImage({
        productCode,
        file
      });
      
      if (result) {
        if (onSuccess) {
          onSuccess();
        }
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error in handleFileDrop:', error);
      toast.error('שגיאה בהעלאת התמונה');
    }
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Image className="w-4 h-4" />
          העלאת תמונה
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>העלאת תמונת מוצר</SheetTitle>
          <SheetDescription>
            העלה תמונה עבור המוצר עם קוד {productCode}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">מעלה תמונה...</p>
            </div>
          ) : (
            <DropZone 
              onFileDrop={handleFileDrop} 
              isUploading={isUploading} 
            />
          )}
          
          <div className="mt-6 text-xs text-muted-foreground">
            <p>פורמטים נתמכים: JPG, PNG, GIF</p>
            <p>גודל מקסימלי: 5MB</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
