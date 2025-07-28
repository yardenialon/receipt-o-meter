
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import Index from './pages/Index';
import Login from './pages/Login';
import Products from './pages/Products';
import ShoppingList from './pages/ShoppingList';
import { ProductDetails } from './components/products/ProductDetails';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  console.log('ProtectedRoute - isLoading:', isLoading, 'user:', user?.email);
  
  if (isLoading) {
    console.log('ProtectedRoute showing loading...');
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse">טוען...</div>
    </div>;
  }
  
  if (!user) {
    console.log('ProtectedRoute redirecting to login...');
    return <Navigate to="/login" replace />;
  }
  
  console.log('ProtectedRoute rendering children for user:', user.email);
  return <>{children}</>;
};

function App() {
  const { user } = useAuth();

  console.log("Current authenticated user:", user);

  return (
    <Router>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {user && <AppSidebar />}
          <main className="flex-1 overflow-x-hidden">
            <div className="md:pb-0 pb-[55px]">
              <Routes>
                <Route path="/login" element={
                  user ? <Navigate to="/" replace /> : <Login />
                } />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/products" element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                } />
                <Route path="/products/:productCode" element={
                  <ProtectedRoute>
                    <ProductDetails />
                  </ProtectedRoute>
                } />
                <Route path="/shopping-list" element={
                  <ProtectedRoute>
                    <ShoppingList />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    </Router>
  );
}

export default App;
