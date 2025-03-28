
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

export default function Products() {
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
    loading
  } = useProductsData({ 
    currentPage, 
    searchTerm 
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
          <ProductsTable 
            productsByCategory={productsByCategory || {}}
            expandedProducts={expandedProducts}
            onToggleExpand={handleToggleExpand}
            loading={loading}
            onSelectProduct={handleAddToShoppingList}
          />
        ) : (
          <ProductsGrid 
            products={flattenedProducts || []} 
            onAddToList={handleAddToShoppingList}
          />
        )}
      </div>
    </div>
  );
}
