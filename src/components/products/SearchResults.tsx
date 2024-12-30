import { Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="space-y-2 absolute w-full bg-white border rounded-md shadow-lg z-10">
      {Object.entries(groupedProducts).map(([itemCode, products]) => {
        const lowestPrice = Math.min(...products.map(p => p.ItemPrice));
        const baseProduct = products[0];

        return (
          <Card key={itemCode} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{baseProduct.ItemName}</h3>
                {baseProduct.ManufacturerName && (
                  <p className="text-sm text-muted-foreground">{baseProduct.ManufacturerName}</p>
                )}
              </div>
              <span className="font-bold text-red-600">₪{lowestPrice.toFixed(2)}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {products.map((product, idx) => (
                <Badge 
                  key={`${product.store_chain}-${idx}`} 
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <Store className="h-3 w-3" />
                  {product.store_chain}
                  {product.store_id && ` - ${product.store_id}`}
                  <span className={product.ItemPrice === lowestPrice ? "text-red-600" : ""}>
                    ₪{product.ItemPrice.toFixed(2)}
                  </span>
                </Badge>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
};