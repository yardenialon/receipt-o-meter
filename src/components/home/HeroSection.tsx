
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SavvyLogo } from '@/components/SavvyLogo';
import { ProductsSearch } from '@/components/products/ProductsSearch';

export function HeroSection() {
  const navigate = useNavigate();

  const goToShoppingList = () => {
    navigate('/shopping-list');
  };

  const handleSearch = (searchTerm: string) => {
    console.log('Searching for:', searchTerm);
    // Can implement actual search navigation if needed
  };

  return (
    <div className="relative overflow-hidden bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <SavvyLogo size={360} className="mb-6" />
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl mb-6">
            <span className="block text-primary-600">זהו את המחירים המשתלמים</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl mb-8">
            חסכו כסף במכולת שלכם על ידי השוואת מחירים חכמה בין רשתות השיווק בישראל
          </p>
          
          {/* חיפוש מרכזי */}
          <div className="w-full max-w-2xl mb-6 relative">
            <ProductsSearch 
              onSearch={handleSearch}
              onProductSelect={(product) => {
                console.log('Selected product:', product);
                // ניתן להוסיף לוגיקה נוספת כאן
              }}
            />
          </div>
          
          {/* כפתור רשימת קניות */}
          <Button 
            onClick={goToShoppingList}
            size="lg" 
            className="mt-4 bg-primary-600 hover:bg-primary-700 text-white"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            רשימת הקניות שלי
          </Button>
        </div>
      </div>
    </div>
  );
}
