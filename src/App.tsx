import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Index from './pages/Index';
import Login from './pages/Login';
import Insights from './pages/Insights';
import { AppSidebar } from './components/AppSidebar';
import { SidebarProvider } from './components/ui/sidebar';

function App() {
  return (
    <Router>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="*"
              element={
                <>
                  <AppSidebar />
                  <div className="flex-1 w-full">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/insights" element={<Insights />} />
                    </Routes>
                  </div>
                </>
              }
            />
          </Routes>
        </div>
      </SidebarProvider>
      <Toaster />
    </Router>
  );
}

export default App;