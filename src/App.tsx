import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import Index from './pages/Index';
import Login from './pages/Login';
import Analytics from './pages/Analytics';
import Products from './pages/Products';
import { useAuth } from '@/hooks/use-auth';

// Admin route wrapper component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isAdmin = user?.id === 'e8f53b8e-499b-4c5c-9fb9-e49d38f93e0f';

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route 
                path="/products" 
                element={
                  <AdminRoute>
                    <Products />
                  </AdminRoute>
                } 
              />
            </Routes>
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    </Router>
  );
}

export default App;