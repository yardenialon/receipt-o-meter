import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsSearch } from '@/components/products/ProductsSearch';
import { PriceFileUpload } from '@/components/products/PriceFileUpload';
import { ProductsStats } from '@/components/products/ProductsStats';
import { toast } from 'sonner';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('יש להתחבר כדי לצפות בעמוד זה');
        navigate('/login');
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="container mx-auto py-8">
      <ProductsHeader />
      <ProductsStats />
      
      <div className="my-8">
        <PriceFileUpload />
      </div>

      <ProductsSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </div>
  );
};

export default Products;