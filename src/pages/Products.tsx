
import { useState } from "react";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { ProductsSearchBar } from "@/components/products/ProductsSearchBar";
import { ProductsTable } from "@/components/products/ProductsTable";
import { ProductsGrid } from "@/components/products/ProductsGrid";
import { ProductImagesBulkUpload } from "@/components/products/ProductImagesBulkUpload";
import { useProductsDisplay } from "@/hooks/useProductsDisplay";
import { useProductsData } from "@/hooks/useProductsData";
import { useShoppingListItems } from "@/hooks/useShoppingListItems";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export default function Products() {
  const { user } = useAuth();
  const [productsPerPage, setProductsPerPage] = useState(24);
  
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
    setProductsPerPage(prevValue => prevValue + 24);
  };

  const hasMoreProducts = flattenedProducts.length < totalProducts;
  
  // Check if user is admin (you can modify this logic based on your needs)
  const isAdmin = user?.email === 'yardenialon5@gmail.com'; // Replace with your admin email
  
  console.log('🔍 Debug Info:');
  console.log('User object:', user);
  console.log('User email:', user?.email);
  console.log('Is admin:', isAdmin);
  console.log('User authenticated:', !!user);

  return (
    <div className="container py-8" dir="rtl">
      <ProductsHeader />
      <div className="space-y-8 mt-8">
        {/* העלאת תמונות מוצרים - מופיע תמיד */}
        <div className="bg-red-100 border-2 border-red-500 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 mb-4 text-center">
            🔧 בדיקה: העלאת תמונות מוצרים
          </h2>
          <div className="text-center mb-4">
            <p>מחובר: {user?.email || 'לא מחובר'}</p>
            <p>מנהל: {isAdmin ? 'כן ✅' : 'לא ❌'}</p>
          </div>
          <ProductImagesBulkUpload />
        </div>
        
        <ProductsSearchBar 
          onSearch={handleSearch} 
          onViewChange={handleViewChange}
          currentView={viewMode}
        />
        
        {viewMode === 'list' ? (
          <ProductsTable 
            productsByCategory={productsByCategory || {}}
            expandedProducts={expandedProducts}
            onToggleExpand={handleToggleExpand}
            loading={loading}
            onSelectProduct={handleAddToShoppingList}
          />
        ) : (
          <div className="space-y-6">
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
          </div>
        )}
      </div>
    </div>
  );
};
