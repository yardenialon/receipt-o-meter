import { Button } from "@/components/ui/button";
import { RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface ProductsHeaderProps {
  onUpdatePrices: () => void;
  isUpdating: boolean;
}

export const ProductsHeader = ({ onUpdatePrices, isUpdating }: ProductsHeaderProps) => {
  const handleXmlUrlUpload = async () => {
    const url = "https://products.groupdocs.app/editor/he/source/pricefull7290027600007-001-202412260300.xml/db77019a-0fe5-472e-b2c2-ba46b6156d1f";
    const networkName = "שופרסל";
    const branchName = "1 - שלי ת\"א- בן יהודה";

    try {
      const { data, error } = await supabase.functions.invoke('fetch-xml-url', {
        body: { url, networkName, branchName }
      });

      if (error) throw error;

      if (data?.count > 0) {
        toast.success(`הועלו ${data.count} מוצרים בהצלחה`);
      } else {
        toast.error('לא הועלו מוצרים. אנא בדוק את תוכן ה-XML');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('שגיאה בהעלאת הקובץ: ' + (err instanceof Error ? err.message : 'אנא נסה שוב'));
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">מוצרים</h1>
      <div className="space-x-2 rtl:space-x-reverse">
        <Button
          variant="outline"
          onClick={handleXmlUrlUpload}
          disabled={isUpdating}
        >
          <Upload className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
          העלה מוצרים מ-URL
        </Button>
        <Button
          variant="outline"
          onClick={onUpdatePrices}
          disabled={isUpdating}
        >
          <RefreshCw className={`h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
          עדכן מחירים
        </Button>
      </div>
    </div>
  );
};