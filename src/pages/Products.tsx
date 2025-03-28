
import { useState } from "react";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { ProductsSearchBar } from "@/components/products/ProductsSearchBar";
import { ProductsTable } from "@/components/products/ProductsTable";
import { ProductsGrid } from "@/components/products/ProductsGrid";
import { useProductsDisplay } from "@/hooks/useProductsDisplay";
import { useProductsData } from "@/hooks/useProductsData";
import { useShoppingListItems } from "@/hooks/useShoppingListItems";
import { toast } from "sonner";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export default function Products() {
  const [productsPerPage, setProductsPerPage] = useState(12);
  
  const { 
    currentPage, 
    searchTerm,
    viewMode,
    expandedProducts, 
    handlePageChange, 
    handleSearch, 
    handleViewChange,
    handleToggleExpand 
  } = useProductsDisplay();
  
  const { 
    productsByCategory,
    flattenedProducts,
    loading,
    totalProducts
  } = useProductsData({ 
    currentPage, 
    searchTerm,
    productsPerPage
  });

  // Get shopping lists to add products to
  const { lists } = useShoppingLists();
  // Add product to shopping list functionality
  const { addItem } = useShoppingListItems();

  const handleAddToShoppingList = (product: any) => {
    if (!lists || lists.length === 0) {
      toast.error("אין רשימות קניות זמינות. אנא צור רשימה חדשה קודם.");
      return;
    }

    // Use the first list by default
    const listId = lists[0].id;
    
    addItem.mutate({
      listId: listId,
      name: product.name || product.product_name,
      productCode: product.code || product.product_code
    }, {
      onSuccess: () => {
        toast.success(`המוצר "${product.name || product.product_name}" נוסף לרשימת הקניות`);
      }
    });
  };

  const handleLoadMore = () => {
    setProductsPerPage(prevValue => prevValue + 12);
  };

  const hasMoreProducts = flattenedProducts.length < totalProducts;

  return (
    <div className="container py-8">
      <ProductsHeader />
      <div className="grid gap-8 mt-8">
        <ProductsSearchBar 
          onSearch={handleSearch} 
          onViewChange={handleViewChange}
          currentView={viewMode}
        />
        
        {viewMode === 'list' ? (
          <>
            <ProductsTable 
              productsByCategory={productsByCategory || {}}
              expandedProducts={expandedProducts}
              onToggleExpand={handleToggleExpand}
              loading={loading}
              onSelectProduct={handleAddToShoppingList}
            />
          </>
        ) : (
          <>
            <ProductsGrid 
              products={flattenedProducts || []} 
              onAddToList={handleAddToShoppingList}
            />

            {hasMoreProducts && (
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={handleLoadMore} 
                  variant="outline" 
                  className="gap-2"
                  disabled={loading}
                >
                  {loading ? 'טוען...' : 'הצג עוד מוצרים'}
                  {!loading && <ArrowDown className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
