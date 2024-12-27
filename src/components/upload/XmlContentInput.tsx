import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, File } from 'lucide-react';

interface XmlContentInputProps {
  xmlContent: string;
  setXmlContent: (content: string) => void;
  isUploading: boolean;
  onUpload: () => void;
}

export const XmlContentInput = ({
  xmlContent,
  setXmlContent,
  isUploading,
  onUpload
}: XmlContentInputProps) => {
  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <Textarea
        placeholder="הדבק כאן את תוכן ה-XML"
        value={xmlContent}
        onChange={(e) => setXmlContent(e.target.value)}
        className="min-h-[200px] font-mono text-sm"
        dir="ltr"
        disabled={isUploading}
      />
      <Button 
        onClick={onUpload}
        disabled={isUploading || !xmlContent.trim()}
        className="w-full flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <div className="animate-spin">
            <File className="w-4 h-4" />
          </div>
        ) : (
          <Upload className="w-4 h-4" />
        )}
        העלה תוכן XML
      </Button>
    </div>
  );
};