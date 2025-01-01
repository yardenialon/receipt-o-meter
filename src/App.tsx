import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import Index from './pages/Index';
import Login from './pages/Login';
import Analytics from './pages/Analytics';
import Products from './pages/Products';
import ShoppingList from './pages/ShoppingList';

function App() {
  return (
    <Router>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1 overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/products" element={<Products />} />
              <Route path="/shopping-list" element={<ShoppingList />} />
            </Routes>
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    </Router>
  );
}

export default App;