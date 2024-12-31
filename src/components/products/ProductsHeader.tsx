import { ShoppingCart } from 'lucide-react';

export const ProductsHeader = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ShoppingCart className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">מוצרים</h1>
      </div>
    </div>
  );
};