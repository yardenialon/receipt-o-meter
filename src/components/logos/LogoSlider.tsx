
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
  { name: 'קשת טעמים', id: 'keshet-teamim' },
  { name: 'סופר יהודה', id: 'super-yehuda' },
  { name: 'פרש מרקט', id: 'fresh-market' },
  { name: 'פוליצר', id: 'politzer' },
  { name: 'ברקת', id: 'bareket' },
  { name: 'שוק העיר', id: 'shuk-hair' },
  { name: 'סופר פארם', id: 'super-pharm' },
  { name: 'סופר ספיר', id: 'super-sapir' },
  { name: 'סיטי מרקט', id: 'city-market' },
  { name: 'גוד פארם', id: 'good-pharm' },
  { name: 'סטופ מרקט', id: 'stop-market' },
  { name: 'היפר כהן', id: 'hyper-cohen' },
  { name: 'טיב טעם', id: 'tiv-taam' },
  { name: 'זול ובגדול', id: 'zol-vbgadol' },
  { name: 'משנת יוסף', id: 'mishnat-yosef' },
  { name: 'קינג סטור', id: 'king-store' },
  { name: 'נתיב החסד', id: 'netiv-hachesed' }
];

export function LogoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleLogos, setVisibleLogos] = useState(5);
  const containerRef = useRef<HTMLDivElement>(null);
  const [duplicatedStores, setDuplicatedStores] = useState<Array<{name: string, id: string}>>([]);

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
      const storesFromDB = uniqueStores.map(storeName => ({
        name: storeName,
        id: storeName.toLowerCase().replace(/\s+/g, '-')
      }));
      
      // שילוב הרשימה הסטטית עם התוצאות מהדאטהבייס
      // ייצור רשימה משולבת ללא כפילויות
      const combinedStores = [...storesFromDB];
      
      // הוספת חנויות מהרשימה הסטטית שחסרות בדאטהבייס
      fallbackStoreChains.forEach(store => {
        if (!combinedStores.some(s => s.name.trim().toLowerCase() === store.name.trim().toLowerCase())) {
          combinedStores.push(store);
        }
      });
      
      // מיון לפי שם
      return combinedStores.sort((a, b) => a.name.localeCompare(b.name, 'he'));
    },
    initialData: fallbackStoreChains
  });

  // יצירת מערך כפול של חנויות כדי ליצור אפקט של לופ אינסופי
  useEffect(() => {
    if (storeChains && storeChains.length > 0) {
      // שכפול המערך כדי ליצור אפקט של לופ אינסופי
      setDuplicatedStores([...storeChains, ...storeChains]);
    }
  }, [storeChains]);

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
    if (!duplicatedStores || duplicatedStores.length <= visibleLogos) return;
    
    setCurrentIndex((prevIndex) => {
      // כאשר מגיעים קרוב לסוף המערך הראשון, נחזור להתחלה באופן חלק
      const nextIndex = prevIndex + 1;
      
      // אם התקרבנו לסוף המערך המקורי, נתחיל לחזור להתחלה
      if (nextIndex >= storeChains?.length) {
        return 0;
      }
      
      return nextIndex;
    });
  };

  const goToPrev = () => {
    if (!duplicatedStores || duplicatedStores.length <= visibleLogos) return;
    
    setCurrentIndex((prevIndex) => {
      // כאשר מגיעים להתחלה, נעבור לסוף המערך הראשון באופן חלק
      if (prevIndex === 0) {
        return Math.max(0, (storeChains?.length || 0) - visibleLogos);
      }
      
      return prevIndex - 1;
    });
  };

  // הפעלת הסליידר אוטומטית באופן איטי
  useEffect(() => {
    if (!duplicatedStores || duplicatedStores.length <= visibleLogos) return;
    
    const interval = setInterval(() => {
      goToNext();
    }, 5000); // 5 שניות לגלילה

    return () => clearInterval(interval);
  }, [visibleLogos, duplicatedStores, storeChains]);

  // במידה ואין מספיק רשתות להציג
  const showControls = (storeChains?.length || 0) > visibleLogos;

  // המיקום האפקטיבי בהתייחס ללופ האינסופי
  const effectiveIndex = currentIndex % (storeChains?.length || 1);

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
            animate={{ x: `-${effectiveIndex * (100 / visibleLogos)}%` }}
            transition={{ ease: "easeInOut", duration: 1.0 }}
          >
            {/* תצוגת המערך המשוכפל ליצירת לופ אינסופי */}
            {storeChains?.map((store, index) => (
              <div 
                key={`${store.id}-${index}`} 
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
            
            {/* שכפול המערך הראשון כדי ליצור תחושת המשכיות */}
            {storeChains?.map((store, index) => (
              <div 
                key={`${store.id}-dup-${index}`} 
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
