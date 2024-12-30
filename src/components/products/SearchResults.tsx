import { Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceComparison } from "./PriceComparison";

interface SearchResult {
  ItemCode: string;
  ItemName: string;
  ItemPrice: number;
  store_chain: string;
  store_id: string | null;
  ManufacturerName: string | null;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
}

export const SearchResults = ({ results, isLoading }: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
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
      <Card className="p-4 text-center text-muted-foreground">
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
    <div className="space-y-2 absolute w-full bg-white border rounded-md shadow-lg z-10 max-h-[80vh] overflow-y-auto">
      {Object.entries(groupedProducts).map(([itemCode, products]) => {
        const baseProduct = products[0];
        const prices = products.map(p => ({
          store_chain: p.store_chain,
          store_id: p.store_id,
          price: p.ItemPrice,
          price_update_date: new Date().toISOString() // או תאריך אמיתי אם קיים
        }));

        return (
          <Card key={itemCode} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="space-y-2">
              <div>
                <h3 className="font-medium">{baseProduct.ItemName}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>מק״ט: {itemCode}</span>
                  {baseProduct.ManufacturerName && (
                    <span>• יצרן: {baseProduct.ManufacturerName}</span>
                  )}
                </div>
              </div>
              
              <PriceComparison prices={prices} />
            </div>
          </Card>
        );
      })}
    </div>
  );
};