
import { useState, useEffect } from 'react';
import { StoreChain, fetchStoreChains, fallbackStoreChains } from '../utils/storeChainUtils';
import { useQuery } from '@tanstack/react-query';

export function useLogoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleLogos, setVisibleLogos] = useState(5);

  // שליפת נתוני רשתות
  const { data: storeChains, isLoading } = useQuery({
    queryKey: ['store-chains'],
    queryFn: fetchStoreChains,
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

  // הזזת הלוגואים שמאלה וימינה עם מעבר חלק
  const goToNext = () => {
    if (!storeChains || storeChains.length <= visibleLogos) return;
    
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      
      // אם הגענו לסוף, נחזור להתחלה בצורה חלקה
      if (nextIndex >= storeChains.length) {
        // מעבר חלק בין הסוף להתחלה
        setTimeout(() => {
          setCurrentIndex(0);
        }, 50);
        return prevIndex;
      }
      
      return nextIndex;
    });
  };

  const goToPrev = () => {
    if (!storeChains || storeChains.length <= visibleLogos) return;
    
    setCurrentIndex((prevIndex) => {
      const prevIndexValue = prevIndex - 1;
      
      // אם הגענו לתחילת הסליידר וצריך לקפוץ לסוף
      if (prevIndexValue < 0) {
        // מעבר חלק להתחלה או לסוף
        setTimeout(() => {
          setCurrentIndex(Math.max(0, storeChains.length - visibleLogos));
        }, 50);
        return 0;
      }
      
      return prevIndexValue;
    });
  };

  // הפעלת הסליידר אוטומטית באופן איטי
  useEffect(() => {
    if (!storeChains || storeChains.length <= visibleLogos) return;
    
    const interval = setInterval(() => {
      goToNext();
    }, 5000); // 5 שניות לגלילה

    return () => clearInterval(interval);
  }, [visibleLogos, storeChains]);

  // החזרת הפריטים לתצוגה עם אלמנט נוסף בסוף להימנעות מרווח
  const getDisplayItems = () => {
    if (!storeChains || storeChains.length === 0) return [];
    
    // יצירת מערך עם מספיק לוגואים להציג ועוד אחד נוסף בסוף
    const visibleCount = visibleLogos + 1; // הוספת עוד לוגו אחד לימין
    
    // יצירת מערך של הפריטים לתצוגה
    const items: (StoreChain & { key: string })[] = [];
    
    // מוסיפים את הלוגואים הרגילים
    for (let i = 0; i < storeChains.length; i++) {
      const actualIndex = (currentIndex + i) % storeChains.length;
      items.push({
        ...storeChains[actualIndex],
        key: `store-${actualIndex}-${i}`
      });

      // אם יש לנו מספיק פריטים לתצוגה כולל הנוסף, מפסיקים
      if (items.length >= visibleCount) break;
    }
    
    // וודא שיש לנו מספיק פריטים גם אם אין מספיק חנויות
    while (items.length < visibleCount && storeChains.length > 0) {
      const index = items.length % storeChains.length;
      items.push({
        ...storeChains[index],
        key: `store-extra-${index}-${items.length}`
      });
    }
    
    return items;
  };

  // האם להציג כפתורי שליטה
  const showControls = (storeChains?.length || 0) > visibleLogos;

  return {
    currentIndex,
    visibleLogos,
    storeChains,
    isLoading,
    goToNext,
    goToPrev,
    getDisplayItems,
    showControls
  };
}
