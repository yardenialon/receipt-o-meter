
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StoreChain, fetchStoreChains, fallbackStoreChains } from '../utils/storeChainUtils';
import { useQuery } from '@tanstack/react-query';

export function useLogoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleLogos, setVisibleLogos] = useState(5);
  const [isAnimating, setIsAnimating] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // שליפת נתוני רשתות
  const { data: storeChains, isLoading } = useQuery({
    queryKey: ['store-chains'],
    queryFn: fetchStoreChains,
    initialData: fallbackStoreChains,
    staleTime: 5 * 60 * 1000, // 5 דקות
    gcTime: 10 * 60 * 1000 // 10 דקות
  });

  console.log('Store chains data:', storeChains);

  // יצירת מערך כפול לאפקט אינסופי
  const duplicatedItems = useMemo(() => {
    if (!storeChains || storeChains.length === 0) return [];
    
    // יוצרים שלושה עותקים של המערך לגלילה אינסופית חלקה
    const items = storeChains.map((store, i) => ({
      ...store,
      key: `item-${store.id}-${i}`
    }));
    
    return [...items, ...items, ...items];
  }, [storeChains]);
  
  // האם להציג כפתורי שליטה
  const showControls = (storeChains?.length || 0) > visibleLogos;
  
  // התחלת הסליידר במרכז המערך הכפול
  useEffect(() => {
    if (storeChains && storeChains.length > 0) {
      setCurrentIndex(storeChains.length); // מתחילים במרכז
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

  // גלילה אינסופית - מעבר לפריט הבא
  const goToNext = useCallback(() => {
    if (!storeChains || storeChains.length <= visibleLogos || isAnimating) return;
    
    setIsAnimating(true);
    
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      
      // אם הגענו לסוף העותק השני, קופצים בחזרה לתחילת העותק הראשון
      if (nextIndex >= storeChains.length * 2) {
        setTimeout(() => {
          setCurrentIndex(storeChains.length);
          setIsAnimating(false);
        }, 300);
        return nextIndex;
      }
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      
      return nextIndex;
    });
  }, [storeChains, visibleLogos, isAnimating]);

  const goToPrev = useCallback(() => {
    if (!storeChains || storeChains.length <= visibleLogos || isAnimating) return;
    
    setIsAnimating(true);
    
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - 1;
      
      // אם הגענו לתחילת העותק הראשון, קופצים לסוף העותק השני
      if (nextIndex < storeChains.length) {
        setTimeout(() => {
          setCurrentIndex(storeChains.length * 2 - 1);
          setIsAnimating(false);
        }, 300);
        return nextIndex;
      }
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      
      return nextIndex;
    });
  }, [storeChains, visibleLogos, isAnimating]);

  // החזרת הפריטים לתצוגה
  const displayItems = useMemo(() => {
    // אם אין נתונים בכלל, נשתמש בנתונים הסטטיים
    const currentStoreChains = storeChains && storeChains.length > 0 ? storeChains : fallbackStoreChains;
    
    if (!currentStoreChains || currentStoreChains.length === 0) return [];
    
    // אם יש לנו פחות פריטים מהמספר הנראה, נחזיר את כל הפריטים
    if (currentStoreChains.length <= visibleLogos) {
      return currentStoreChains.map((store, i) => ({
        ...store,
        key: `visible-${store.id}-${i}`
      }));
    }
    
    // אחרת, נשתמש בלוגיקת הגלילה האינסופית
    if (!duplicatedItems.length) return [];
    
    const itemsToShow = [];
    for (let i = 0; i < visibleLogos; i++) {
      const itemIndex = (currentIndex + i) % duplicatedItems.length;
      itemsToShow.push(duplicatedItems[itemIndex]);
    }
    
    return itemsToShow;
  }, [storeChains, duplicatedItems, currentIndex, visibleLogos]);

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
