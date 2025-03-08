
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
      
      // אם הגענו לסוף מקטע הדאפליקציה, נחזור אחורה למיקום האמיתי בלי אנימציה
      if (nextIndex >= storeChains.length) {
        // עדכון מיידי למניעת פער
        setTimeout(() => {
          setCurrentIndex(0);
        }, 0);
        return storeChains.length - 1;
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
        // עדכון מיידי למניעת פער
        setTimeout(() => {
          setCurrentIndex(storeChains.length - visibleLogos);
        }, 0);
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

  // החזרת הפריטים לתצוגה ללא צורך באלמנטים כפולים בצדדים
  const getDisplayItems = () => {
    if (!storeChains || storeChains.length === 0) return [];
    
    // שימוש בכל המערך הקיים עם מפתחות ייחודיים
    return storeChains.map((store, index) => ({
      ...store,
      key: `store-${index}`
    }));
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
