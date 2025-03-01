
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadProductImage } from '@/utils/product-images/productImageUtils';

interface ProductImageUploadProps {
  productCode: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function ProductImageUpload({ 
  productCode, 
  onSuccess,
  trigger 
}: ProductImageUploadProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isPrimary, setIsPrimary] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      
      // Create preview
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      
      // Clean up the preview URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  });

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setIsPrimary(false);
    setIsUploading(false);
  };

  const handleClose = () => {
    resetState();
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!file) return;
    
    setIsUploading(true);
    const result = await uploadProductImage(file, productCode, isPrimary);
    setIsUploading(false);
    
    if (result) {
      onSuccess?.();
      handleClose();
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            העלאת תמונה
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>העלאת תמונת מוצר</DialogTitle>
          <DialogDescription>
            העלה תמונה עבור מוצר #{productCode}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!file ? (
            <div 
              {...getRootProps()} 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input {...getInputProps()} />
              <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                גרור ושחרר קובץ תמונה כאן, או לחץ לבחירת קובץ
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG או WEBP עד 5MB
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="relative border rounded-lg overflow-hidden">
                {preview && (
                  <img 
                    src={preview} 
                    alt="תצוגה מקדימה" 
                    className="w-full h-[200px] object-contain"
                  />
                )}
                <button 
                  onClick={removeFile}
                  type="button"
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-center mt-2">{file.name}</p>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="primary" 
              checked={isPrimary}
              onCheckedChange={setIsPrimary}
            />
            <Label htmlFor="primary" className="mr-2">הגדר כתמונה ראשית</Label>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
          >
            ביטול
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!file || isUploading}
          >
            {isUploading ? 'מעלה...' : 'העלה תמונה'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
