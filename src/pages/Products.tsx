
import { useState } from "react";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { ProductsSearch } from "@/components/products/ProductsSearch";
import { ProductsStats } from "@/components/products/ProductsStats";
import { ProductsTable } from "@/components/products/ProductsTable";
import { PriceFileUpload } from "@/components/products/PriceFileUpload";
import { ProductImageUpload } from "@/components/products/ProductImageUpload";
import { ChainMappingUpload } from "@/components/products/ChainMappingUpload";
import { YeinotBitanDataFetch } from "@/components/products/YeinotBitanDataFetch";
import { useProductsDisplay } from "@/hooks/useProductsDisplay";
import { useProductsData } from "@/hooks/useProductsData";

export default function Products() {
  const [selectedProductCode, setSelectedProductCode] = useState<string>("");
  
  const { 
    currentPage, 
    searchTerm, 
    expandedProducts, 
    handlePageChange, 
    handleSearch, 
    handleToggleExpand 
  } = useProductsDisplay();
  
  const { 
    productsByCategory,
    loading
  } = useProductsData({ 
    currentPage, 
    searchTerm 
  });

  return (
    <div className="container py-8">
      <ProductsHeader />
      <div className="grid gap-8 mt-8">
        <ProductsStats />
        <ProductsSearch onSearch={handleSearch} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PriceFileUpload />
          <YeinotBitanDataFetch />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedProductCode && (
            <ProductImageUpload productCode={selectedProductCode} />
          )}
          <ChainMappingUpload />
        </div>
        <ProductsTable 
          productsByCategory={productsByCategory || {}}
          expandedProducts={expandedProducts}
          onToggleExpand={handleToggleExpand}
          loading={loading}
          onSelectProduct={setSelectedProductCode}
        />
      </div>
    </div>
  );
}
