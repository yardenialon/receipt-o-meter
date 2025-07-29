
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/useUserRole';
import Index from './pages/Index';
import Login from './pages/Login';
import Products from './pages/Products';
import ShoppingList from './pages/ShoppingList';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProductDetails } from './components/products/ProductDetails';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse">טוען...</div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading, role } = useUserRole();
  
  console.log('🔐 AdminRoute check:', { user: !!user, isLoading, roleLoading, isAdmin, role });
  
  if (isLoading || roleLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse">טוען...</div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { user } = useAuth();
  
  console.log('🎯 App component - user exists:', !!user);

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
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
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
