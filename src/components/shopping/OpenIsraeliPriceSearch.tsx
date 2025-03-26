
import { useState } from 'react';
import { useOpenIsraeliAPI } from '@/hooks/useOpenIsraeliAPI';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Plus, Store } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import { StoreLogo } from '@/components/shopping/comparison/StoreLogo';

export function OpenIsraeliPriceSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState<string | undefined>();
  const [selectedStore, setSelectedStore] = useState<string | undefined>();
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>();
  const [selectedListId, setSelectedListId] = useState<string | undefined>();

  const { useChains, useStores, useProductSearch, useProductPrices, useAddProductToList } = useOpenIsraeliAPI();
  const { data: chains, isLoading: chainsLoading } = useChains();
  const { data: stores, isLoading: storesLoading } = useStores(selectedChain);
  const { data: products, isLoading: productsLoading } = useProductSearch(searchQuery, selectedChain, selectedStore);
  const { data: prices, isLoading: pricesLoading } = useProductPrices(selectedProduct || '');
  
  const { lists } = useShoppingLists();
  const addProductToList = useAddProductToList();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The useProductSearch hook will automatically fetch when searchQuery changes
  };

  const handleAddToList = (product: any) => {
    if (!selectedListId) return;
    
    addProductToList.mutate({
      listId: selectedListId,
      product
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">חיפוש מחירים בזמן אמת</h2>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">רשת שיווק</label>
          <Select value={selectedChain} onValueChange={setSelectedChain}>
            <SelectTrigger>
              <SelectValue placeholder="בחר רשת" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">כל הרשתות</SelectItem>
              {chainsLoading ? (
                <SelectItem value="loading" disabled>טוען רשתות...</SelectItem>
              ) : (
                chains?.map(chain => (
                  <SelectItem key={chain.id} value={chain.id}>
                    {chain.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">סניף</label>
          <Select 
            value={selectedStore} 
            onValueChange={setSelectedStore}
            disabled={!selectedChain}
          >
            <SelectTrigger>
              <SelectValue placeholder={selectedChain ? "בחר סניף" : "יש לבחור רשת תחילה"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">כל הסניפים</SelectItem>
              {storesLoading ? (
                <SelectItem value="loading" disabled>טוען סניפים...</SelectItem>
              ) : (
                stores?.map(store => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name} - {store.address}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">רשימת קניות</label>
          <Select 
            value={selectedListId} 
            onValueChange={setSelectedListId}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר רשימה להוספת מוצרים" />
            </SelectTrigger>
            <SelectContent>
              {!lists?.length ? (
                <SelectItem value="none" disabled>אין רשימות קניות</SelectItem>
              ) : (
                lists?.map(list => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="הקלד שם מוצר לחיפוש..."
          className="flex-1"
        />
        <Button type="submit">
          <Search className="ml-2 h-4 w-4" />
          חפש
        </Button>
      </form>
      
      {/* Search results */}
      {productsLoading && searchQuery.length >= 2 && (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}
      
      {!productsLoading && searchQuery.length >= 2 && products?.length === 0 && (
        <div className="text-center p-4 text-gray-500">
          לא נמצאו תוצאות עבור "{searchQuery}"
        </div>
      )}
      
      {!productsLoading && products && products.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium">תוצאות חיפוש</h3>
          <div className="grid grid-cols-1 gap-3">
            {products.map(product => (
              <Card key={product.code} className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">
                    {product.manufacturer} | קוד: {product.code}
                  </div>
                  {product.price && (
                    <div className="text-green-600 font-medium mt-1">
                      ₪{product.price.toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedProduct(product.code)}
                  >
                    <Store className="h-4 w-4 ml-1" />
                    השוואת מחירים
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleAddToList(product)}
                    disabled={!selectedListId}
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    הוסף לרשימה
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Price comparison */}
      {selectedProduct && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-3">השוואת מחירים למוצר</h3>
          
          {pricesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : prices && prices.length > 0 ? (
            <div className="space-y-3">
              {prices.sort((a, b) => a.price - b.price).map((price, index) => {
                const chain = chains?.find(c => c.id === price.chain_id);
                const store = stores?.find(s => s.id === price.store_id);
                const isCheapest = index === 0;
                
                return (
                  <Card 
                    key={`${price.chain_id}-${price.store_id}`}
                    className={`p-4 ${isCheapest ? 'border-green-200 bg-green-50/30' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <StoreLogo 
                          storeName={chain?.name || price.chain_id} 
                          className="h-8 w-auto"
                        />
                        <div>
                          <div className="font-medium">{chain?.name}</div>
                          <div className="text-sm text-gray-500">
                            {store?.name || `סניף ${price.store_id}`}
                          </div>
                          <div className="text-xs text-gray-400">
                            עדכון: {new Date(price.update_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">₪{price.price.toFixed(2)}</div>
                        {isCheapest && (
                          <div className="text-xs text-green-600 font-medium">המחיר הזול ביותר</div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-4 text-gray-500">
              לא נמצאו מחירים זמינים למוצר זה
            </div>
          )}
        </div>
      )}
    </div>
  );
}
