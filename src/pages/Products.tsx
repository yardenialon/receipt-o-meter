import { ProductsStats } from '@/components/products/ProductsStats';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsSearch } from '@/components/products/ProductsSearch';
import { KeshetFileUpload } from '@/components/products/KeshetFileUpload';

export default function Products() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <ProductsHeader />
      <ProductsStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProductsSearch />
        <KeshetFileUpload />
      </div>
    </div>
  );
}