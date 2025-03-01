
// App.tsx - Main application component
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Products from './pages/Products';
import ShoppingList from './pages/ShoppingList';
import ProductImages from './pages/ProductImages';
import { Sidebar } from '@/components/ui/sidebar';
import { SiteHeader } from './components/SiteHeader';
import Upload from './pages/Upload';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isLoggedIn = true; // Replace with your actual authentication logic

  useEffect(() => {
    // Simple initialization to verify React is rendering
    try {
      console.log('App is initializing...');
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize app:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setIsLoading(false);
    }
  }, []);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-red-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">שגיאה בטעינת האפליקציה</h1>
          <p className="text-gray-700 mb-4">אירעה שגיאה בעת טעינת האפליקציה:</p>
          <div className="bg-red-50 p-4 rounded border border-red-200">
            <code className="text-sm text-red-800">{error.message}</code>
          </div>
          <button 
            className="mt-6 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען את האפליקציה...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50">
        {isLoggedIn && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <SiteHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6">
            <Routes>
              <Route path="/" element={<Products />} />
              <Route path="/shopping-list" element={<ShoppingList />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/product-images" element={<ProductImages />} />
            </Routes>
          </main>
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;
