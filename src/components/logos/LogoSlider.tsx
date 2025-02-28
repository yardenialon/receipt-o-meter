
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StoreLogo } from '@/components/shopping/comparison/StoreLogo';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// רשימה סטטית של רשתות במקרה שאין תוצאות מה-API
const fallbackStoreChains = [
  { name: 'רמי לוי', id: 'rami-levy' },
  { name: 'שופרסל', id: 'shufersal' },
  { name: 'יינות ביתן', id: 'yeinot-bitan' },
  { name: 'ויקטורי', id: 'victory' },
  { name: 'יוחננוף', id: 'yochananof' },
  { name: 'מחסני השוק', id: 'machsanei-hashuk' },
  { name: 'קרפור', id: 'carrefour' },
  { name: 'אושר עד', id: 'osher-ad' },
  { name: 'חצי חינם', id: 'hatzi-hinam' },
];

export function LogoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleLogos, setVisibleLogos] = useState(5);
  const containerRef = useRef<HTMLDivElement>(null);

  // שליפת כל רשתות המזון מהדאטהבייס
  const { data: storeChains, isLoading } = useQuery({
    queryKey: ['store-chains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_products')
        .select('store_chain')
        .order('store_chain')
        .not('store_chain', 'is', null);

      if (error) {
        console.error('Error fetching store chains:', error);
        return fallbackStoreChains;
      }

      // הסרת כפילויות
      const uniqueStores = Array.from(new Set(data.map(item => item.store_chain)));
      
      // המרה לפורמט הנדרש
      return uniqueStores.map(storeName => ({
        name: storeName,
        id: storeName.toLowerCase().replace(/\s+/g, '-')
      }));
    },
    initialData: fallbackStoreChains
  });

  // התאמה למספר הלוגואים המוצגים בהתאם לרוחב המסך
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleLogos(3);
      } else if (width < 768) {
        setVisibleLogos(4);
      } else if (width < 1024) {
        setVisibleLogos(5);
      } else {
        setVisibleLogos(6);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // הזזת הלוגואים שמאלה וימינה
  const goToNext = () => {
    if (!storeChains || storeChains.length <= visibleLogos) return;
    
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % (storeChains.length - visibleLogos + 1)
    );
  };

  const goToPrev = () => {
    if (!storeChains || storeChains.length <= visibleLogos) return;
    
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? storeChains.length - visibleLogos : prevIndex - 1
    );
  };

  // הפעלת הסליידר אוטומטית
  useEffect(() => {
    if (!storeChains || storeChains.length <= visibleLogos) return;
    
    const interval = setInterval(() => {
      goToNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [visibleLogos, storeChains]);

  // וידוא שלא חורגים מגבולות המערך
  const adjustedIndex = Math.min(
    currentIndex, 
    (storeChains?.length || 0) - visibleLogos
  );

  // במידה ואין מספיק רשתות להציג
  const showControls = (storeChains?.length || 0) > visibleLogos;

  return (
    <div className="relative py-8">
      <div className="flex items-center justify-between">
        {showControls && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full absolute left-0 z-10 opacity-80 shadow-sm"
            onClick={goToPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        <div 
          ref={containerRef}
          className="overflow-hidden mx-10"
        >
          <motion.div 
            className="flex items-center gap-6"
            initial={false}
            animate={{ x: `-${adjustedIndex * (100 / visibleLogos)}%` }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
          >
            {storeChains?.map((store) => (
              <div 
                key={store.id} 
                className={cn(
                  "flex-shrink-0 flex flex-col items-center justify-center",
                  `w-[${100 / visibleLogos}%]`
                )}
                style={{ width: `${100 / visibleLogos}%` }}
              >
                <div className="h-16 w-full bg-white rounded-lg shadow-sm border p-2 flex items-center justify-center">
                  <StoreLogo 
                    storeName={store.name} 
                    className="max-h-12 max-w-full object-contain" 
                  />
                </div>
                <span className="mt-2 text-sm text-center text-gray-700">
                  {store.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {showControls && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full absolute right-0 z-10 opacity-80 shadow-sm"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
