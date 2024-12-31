import { Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceComparison } from "./PriceComparison";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface SearchResult {
  ItemCode: string;
  ItemName: string;
  ItemPrice: number;
  store_chain: string;
  store_id: string | null;
  ManufacturerName: string | null;
  PriceUpdateDate?: string | null;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  onProductSelect?: (product: SearchResult) => void;
}

export const SearchResults = ({ results, isLoading, onProductSelect }: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="fixed inset-x-0 top-[4.5rem] md:relative md:top-0 bg-white/80 backdrop-blur-sm border-t md:border md:rounded-md shadow-lg z-50 p-4 space-y-2 max-h-[80vh] overflow-y-auto">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="fixed inset-x-0 top-[4.5rem] md:relative md:top-0 bg-white/80 backdrop-blur-sm border-t md:border md:rounded-md shadow-lg z-50 p-4 text-center text-muted-foreground">
        לא נמצאו תוצאות
      </Card>
    );
  }

  // Group products by ItemCode to compare prices
  const groupedProducts = results.reduce((acc, product) => {
    if (!acc[product.ItemCode]) {
      acc[product.ItemCode] = [];
    }
    acc[product.ItemCode].push(product);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="fixed inset-x-0 top-[4.5rem] md:relative md:top-0 bg-white/80 backdrop-blur-sm border-t md:border md:rounded-md shadow-lg z-50 max-h-[80vh] overflow-y-auto">
      <div className="p-4 space-y-4 divide-y divide-gray-100">
        {Object.entries(groupedProducts).map(([itemCode, products]) => {
          const baseProduct = products[0];
          const prices = products.map(p => ({
            store_chain: p.store_chain,
            store_id: p.store_id,
            price: p.ItemPrice,
            price_update_date: p.PriceUpdateDate || new Date().toISOString()
          }));

          const formattedDate = baseProduct.PriceUpdateDate 
            ? format(new Date(baseProduct.PriceUpdateDate), "dd/MM/yyyy", { locale: he })
            : null;

          return (
            <Card key={itemCode} className="p-4 bg-white border-0 shadow-none first:pt-0 last:pb-0">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-medium text-base">{baseProduct.ItemName}</h3>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <span className="text-xs">מק״ט:</span> {itemCode}
                      </span>
                      {formattedDate && (
                        <span className="text-xs text-muted-foreground">
                          עודכן בתאריך: {formattedDate}
                        </span>
                      )}
                      {baseProduct.ManufacturerName && (
                        <span className="inline-flex items-center gap-1">
                          <span className="text-xs">יצרן:</span> {baseProduct.ManufacturerName}
                        </span>
                      )}
                    </div>
                  </div>
                  {onProductSelect && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => onProductSelect(baseProduct)}
                      className="w-full md:w-auto"
                    >
                      הוסף לרשימה
                    </Button>
                  )}
                </div>
                
                <PriceComparison 
                  prices={prices.map(price => ({
                    ...price,
                    storeName: (
                      <div className="flex flex-col md:flex-row md:items-center gap-1">
                        <span className="font-medium">{price.store_chain}</span>
                        {price.store_id && (
                          <span className="text-xs text-muted-foreground md:before:content-['•'] md:before:mx-1">
                            סניף {price.store_id}
                          </span>
                        )}
                      </div>
                    )
                  }))} 
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};