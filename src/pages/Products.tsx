import { useState } from 'react';
import { ProductsStats } from '@/components/products/ProductsStats';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsSearch } from '@/components/products/ProductsSearch';
import { PriceFileUpload } from '@/components/products/PriceFileUpload';
import { PriceFileTest } from '@/components/products/PriceFileTest';

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="container mx-auto p-4 space-y-8">
      <ProductsHeader />
      <ProductsStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProductsSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <PriceFileUpload />
      </div>
      <PriceFileTest />
    </div>
  );
}