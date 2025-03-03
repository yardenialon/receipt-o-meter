
import { useNavigate } from 'react-router-dom';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsTable } from '@/components/products/ProductsTable';
import { ProductsGrid } from '@/components/products/ProductsGrid';
import { ProductsSearchBar } from '@/components/products/ProductsSearchBar';
import { Button } from '@/components/ui/button';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useProductsData } from '@/hooks/useProductsData';
import { useProductsDisplay } from '@/hooks/useProductsDisplay';

const PRODUCTS_PER_PAGE = 50;

const Products = () => {
  const navigate = useNavigate();
  
  const { 
    currentPage, 
    viewMode, 
    searchTerm, 
    expandedProducts,
    handlePageChange,
    handleSearch,
    handleViewChange,
    handleToggleExpand,
    getPageNumbers
  } = useProductsDisplay();
  
  const {
    loading,
    totalProducts,
    productsByCategory,
    flattenedProducts,
    fetchProducts
  } = useProductsData({ 
    currentPage, 
    searchTerm, 
    productsPerPage: PRODUCTS_PER_PAGE 
  });

  const handleRowClick = (productCode: string) => {
    navigate(`/products/${productCode}`);
  };

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  return (
    <div className="p-6 space-y-6">
      <ProductsHeader />
      
      <ProductsSearchBar 
        onSearch={handleSearch}
        onViewChange={handleViewChange}
        currentView={viewMode}
      />
      
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2">טוען מוצרים...</p>
        </div>
      ) : flattenedProducts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">לא נמצאו מוצרים</p>
          <Button 
            className="mt-4"
            onClick={() => {
              handleSearch('');
              fetchProducts();
            }}
          >
            נסה שוב
          </Button>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <ProductsTable 
              productsByCategory={productsByCategory} 
              expandedProducts={expandedProducts}
              onToggleExpand={handleToggleExpand}
              onRowClick={handleRowClick}
            />
          ) : (
            <ProductsGrid products={flattenedProducts} />
          )}
          
          {totalPages > 1 && (
            <Pagination className="mt-6 flex justify-center">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }} 
                    className={currentPage === 1 ? "opacity-50 pointer-events-none" : ""}
                  />
                </PaginationItem>
                
                {currentPage > 3 && (
                  <>
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(1);
                        }}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  </>
                )}
                
                {getPageNumbers(totalPages).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      href="#" 
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                {currentPage < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(totalPages);
                        }}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "opacity-50 pointer-events-none" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
