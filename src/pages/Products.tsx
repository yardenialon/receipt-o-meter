import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsSearch } from '@/components/products/ProductsSearch';
import { ProductsStats } from '@/components/products/ProductsStats';
import { toast } from 'sonner';
import { Database } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [importCount, setImportCount] = useState<number | null>(null);
  const navigate = useNavigate();
  
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

  // Fetch import count
  useEffect(() => {
    const fetchImportCount = async () => {
      const { count, error } = await supabase
        .from('store_products_import')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error fetching import count:', error);
        toast.error('שגיאה בטעינת נתוני ייבוא');
      } else {
        setImportCount(count);
      }
    };

    fetchImportCount();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <ProductsHeader />
      <ProductsStats />
      
      {importCount !== null && importCount > 0 && (
        <Alert className="my-4 bg-blue-50">
          <Database className="h-4 w-4" />
          <AlertDescription>
            יש {importCount} מוצרים בטבלת הייבוא המוכנים לעיבוד
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-8">
        <ProductsSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>
    </div>
  );
};

export default Products;