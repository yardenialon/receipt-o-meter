import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { SiteHeader } from '@/components/SiteHeader';
import { Sidebar } from '@/components/sidebar/Sidebar';
import Products from './pages/Products';
import { ShoppingList } from './pages/ShoppingList';
import { Upload } from './pages/Upload';
import ProductImages from './pages/ProductImages';

function App() {
  const isLoggedIn = true; // Replace with your actual authentication logic

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
    </BrowserRouter>
  );
}

export default App;
