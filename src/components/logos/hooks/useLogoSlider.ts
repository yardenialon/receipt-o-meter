
import { useState, useEffect, useCallback, useMemo } from 'react';
import { StoreChain, fetchStoreChains, fallbackStoreChains } from '../utils/storeChainUtils';
import { useQuery } from '@tanstack/react-query';

export function useLogoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleLogos, setVisibleLogos] = useState(5);
  const [isAnimating, setIsAnimating] = useState(false);

  // שליפת נתוני רשתות
  const { data: storeChains, isLoading } = useQuery({
    queryKey: ['store-chains'],
    queryFn: fetchStoreChains,
    initialData: fallbackStoreChains
  });

  // חישוב מספר הכפילויות שיש להוסיף לפני ואחרי
  const duplicatesCount = useMemo(() => Math.max(visibleLogos, 3), [visibleLogos]);
  
  // יצירת מערך הלוגואים עם כפילויות לפני ואחרי
  const extendedItems = useMemo(() => {
    if (!storeChains || storeChains.length === 0) return [];
    
    // יצירת חלק קדמי (prefix)
    const prefix = storeChains.slice(-duplicatesCount).map((store, i) => ({
      ...store,
      key: `prefix-${store.id}-${i}`
    }));
    
    // רשימת הלוגואים המקורית
    const original = storeChains.map((store, i) => ({
      ...store,
      key: `original-${store.id}-${i}`
    }));
    
    // יצירת חלק אחורי (suffix)
    const suffix = storeChains.slice(0, duplicatesCount).map((store, i) => ({
      ...store,
      key: `suffix-${store.id}-${i}`
    }));
    
    // שילוב כל החלקים
    return [...prefix, ...original, ...suffix];
  }, [storeChains, duplicatesCount]);
  
  // חישוב האינדקס המקסימלי לגלילה
  const maxIndex = useMemo(() => {
    if (!storeChains) return 0;
    return storeChains.length;
  }, [storeChains]);
  
  // האם להציג כפתורי שליטה
  const showControls = (storeChains?.length || 0) > visibleLogos;
  
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

  // לוגיקת המעבר לפריט הבא עם קפיצה חלקה כשמגיעים לסוף
  const goToNext = useCallback(() => {
    if (!storeChains || storeChains.length <= visibleLogos || isAnimating) return;
    
    setIsAnimating(true);
    
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      
      // אם הגענו לסוף המערך המקורי (לפני ה-suffix)
      if (nextIndex >= maxIndex) {
        // נעבור לאחור באופן שקוף כדי ליצור אפקט של גלילה אינסופית
        setTimeout(() => {
          setCurrentIndex(0);
          setIsAnimating(false);
        }, 500); // זמן השווה לזמן האנימציה ב-CSS
        return nextIndex;
      }
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      
      return nextIndex;
    });
  }, [storeChains, visibleLogos, maxIndex, isAnimating]);

  const goToPrev = useCallback(() => {
    if (!storeChains || storeChains.length <= visibleLogos || isAnimating) return;
    
    setIsAnimating(true);
    
    setCurrentIndex((prevIndex) => {
      const prevIndexValue = prevIndex - 1;
      
      // אם הגענו לתחילת המערך המקורי (אחרי ה-prefix)
      if (prevIndexValue < 0) {
        // נעבור קדימה באופן שקוף כדי ליצור אפקט של גלילה אינסופית
        setTimeout(() => {
          setCurrentIndex(maxIndex - 1);
          setIsAnimating(false);
        }, 500); // זמן השווה לזמן האנימציה ב-CSS
        return prevIndexValue;
      }
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      
      return prevIndexValue;
    });
  }, [storeChains, visibleLogos, maxIndex, isAnimating]);

  // החזרת הפריטים הנוכחיים שצריכים להיות בתצוגה
  const displayItems = useMemo(() => {
    // אם אין נתונים, נחזיר מערך ריק
    if (!extendedItems.length) return [];
    
    // חישוב האינדקס האמיתי עם התחשבות בקבוצת ה-prefix
    const startIndex = duplicatesCount + currentIndex;
    
    // יצירת המערך של הפריטים לתצוגה (לפי הגודל של visibleLogos + 1 לחפיפה)
    const itemsToDisplay = [];
    for (let i = 0; i < visibleLogos + 1; i++) {
      const itemIndex = (startIndex + i) % extendedItems.length;
      itemsToDisplay.push(extendedItems[itemIndex]);
    }
    
    return itemsToDisplay;
  }, [extendedItems, currentIndex, duplicatesCount, visibleLogos]);

  return {
    currentIndex,
    visibleLogos,
    storeChains,
    isLoading,
    goToNext,
    goToPrev,
    displayItems,
    showControls,
    isAnimating
  };
}
