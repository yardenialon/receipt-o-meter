
import { useState } from 'react';

interface UseProductsDisplayProps {
  onPageChange?: (page: number) => void;
  onSearchTermChange?: (term: string) => void;
}

export const useProductsDisplay = ({ 
  onPageChange, 
  onSearchTermChange 
}: UseProductsDisplayProps = {}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid'); // Default to grid view
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<Record<string, { expanded: boolean }>>({});

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedProducts({}); // Reset expanded state when changing page
    if (onPageChange) {
      onPageChange(page);
    }
  };
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
    if (onSearchTermChange) {
      onSearchTermChange(term);
    }
  };
  
  const handleViewChange = (view: 'list' | 'grid') => {
    setViewMode(view);
  };
  
  const handleToggleExpand = (productCode: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productCode]: { expanded: !prev[productCode]?.expanded }
    }));
  };

  // Helper to get pagination numbers for display
  const getPageNumbers = (totalPages: number) => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  return {
    currentPage,
    viewMode,
    searchTerm,
    expandedProducts,
    handlePageChange,
    handleSearch,
    handleViewChange,
    handleToggleExpand,
    getPageNumbers
  };
};
