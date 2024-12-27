interface ProductsStatsProps {
  totalProducts: number;
  totalStoreChains: number;
  storeChains: string[];
}

export const ProductsStats = ({ totalProducts, totalStoreChains, storeChains }: ProductsStatsProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">סה״כ מוצרים</h3>
          <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">רשתות</h3>
          <p className="text-2xl font-bold text-green-600">{totalStoreChains}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">שמות הרשתות</h3>
          <p className="text-sm text-purple-600">{storeChains.join(', ')}</p>
        </div>
      </div>
    </div>
  );
};