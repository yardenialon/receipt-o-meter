
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";

interface SearchResultsProps {
  results: Array<{
    id: string;
    product_name: string;
    product_code?: string;
    price?: number;
    store_chain?: string;
  }>;
  isLoading: boolean;
  onSelect: (result: any) => void;
}

export const SearchResults = ({ results, isLoading, onSelect }: SearchResultsProps) => {
  if (isLoading) {
    return (
      <Card className="absolute top-full left-0 right-0 mt-1 z-10 shadow-lg max-h-64 overflow-hidden">
        <div className="p-4 text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
          טוען...
        </div>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="absolute top-full left-0 right-0 mt-1 z-10 shadow-lg">
        <div className="p-4 text-center text-muted-foreground">
          לא נמצאו תוצאות
        </div>
      </Card>
    );
  }

  return (
    <Card className="absolute top-full left-0 right-0 mt-1 z-10 shadow-lg">
      <ScrollArea className="max-h-64">
        <div className="p-1">
          {results.map((result) => (
            <div
              key={`${result.id}-${result.product_code}`}
              className="p-2 hover:bg-muted rounded-md cursor-pointer flex justify-between items-center"
              onClick={() => {
                console.log('Selecting product:', result);
                onSelect(result);
              }}
            >
              <div className="flex flex-col">
                <div className="font-medium">{result.product_name}</div>
                {result.product_code && (
                  <div className="text-xs text-muted-foreground">
                    קוד: {result.product_code}
                  </div>
                )}
              </div>
              {result.price && (
                <div className="text-sm font-semibold">
                  {formatCurrency(result.price)}
                </div>
              )}
              {result.store_chain && (
                <div className="text-xs text-muted-foreground mr-2">
                  {result.store_chain}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
