
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

  // הזזת הלוגואים שמאלה וימינה
  const goToNext = () => {
    if (!storeChains || storeChains.length <= visibleLogos) return;
    
    setCurrentIndex((prevIndex) => {
      // קידום רגיל, מעבר מעגלי חלק
      const nextIndex = prevIndex + 1;
      // אם הגענו לסוף, נחזור לתחילת המערך
      return nextIndex >= storeChains.length ? 0 : nextIndex;
    });
  };

  const goToPrev = () => {
    if (!storeChains || storeChains.length <= visibleLogos) return;
    
    setCurrentIndex((prevIndex) => {
      // נסיגה אחורה, מעבר מעגלי חלק
      const prevIndexValue = prevIndex - 1;
      // אם הגענו להתחלה (מתחת לאפס), נקפוץ לסוף המערך
      return prevIndexValue < 0 ? storeChains.length - 1 : prevIndexValue;
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

  // יצירת מערך עזר לתצוגה חלקה ולופית של הלוגואים
  const getDisplayItems = () => {
    if (!storeChains || storeChains.length === 0) return [];
    
    // מספר הפריטים המינימלי שצריך להציג לפני ואחרי כדי ליצור לופ חלק
    const itemCount = storeChains.length;
    const duplicatesNeeded = Math.max(visibleLogos, Math.ceil(visibleLogos * 1.5));
    
    let items = [];
    
    // הוספת פריטים מסביב לאינדקס הנוכחי
    for (let i = -duplicatesNeeded; i < itemCount + duplicatesNeeded; i++) {
      // חישוב האינדקס המעגלי במערך המקורי
      const realIndex = (currentIndex + i + itemCount) % itemCount;
      const store = {...storeChains[realIndex], key: `slide-${i}`};
      items.push(store);
    }
    
    return items;
  };

  // במידה ואין מספיק רשתות להציג
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
