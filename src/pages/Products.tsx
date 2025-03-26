
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { ProductsSearch } from "@/components/products/ProductsSearch";
import { ProductsStats } from "@/components/products/ProductsStats";
import { ProductsTable } from "@/components/products/ProductsTable";
import { PriceFileUpload } from "@/components/products/PriceFileUpload";
import { ProductImageUpload } from "@/components/products/ProductImageUpload";
import { ChainMappingUpload } from "@/components/products/ChainMappingUpload";
import { YeinotBitanDataFetch } from "@/components/products/YeinotBitanDataFetch";

export default function Products() {
  return (
    <div className="container py-8">
      <ProductsHeader />
      <div className="grid gap-8 mt-8">
        <ProductsStats />
        <ProductsSearch />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PriceFileUpload />
          <YeinotBitanDataFetch />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProductImageUpload />
          <ChainMappingUpload />
        </div>
        <ProductsTable />
      </div>
    </div>
  );
}
