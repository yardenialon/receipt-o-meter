
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
        setVisibleLogos(2);
      } else if (width < 768) {
        setVisibleLogos(3);
      } else if (width < 1024) {
        setVisibleLogos(4);
      } else if (width < 1280) {
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
      const maxIndex = storeChains.length - 1;
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };

  const goToPrev = () => {
    if (!storeChains || storeChains.length <= visibleLogos) return;
    
    setCurrentIndex((prevIndex) => {
      const maxIndex = storeChains.length - 1;
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
  };

  // הפעלת הסליידר אוטומטית באופן מתון
  useEffect(() => {
    if (!storeChains || storeChains.length <= visibleLogos) return;
    
    const interval = setInterval(() => {
      goToNext();
    }, 3000); // 3 שניות לגלילה

    return () => clearInterval(interval);
  }, [visibleLogos, storeChains]);

  // יצירת מערך עזר לתצוגה חלקה ולופית של הלוגואים
  const getDisplayItems = () => {
    if (!storeChains || storeChains.length === 0) return [];
    
    // בונים מערך מעגלי של כל הפריטים להצגה רציפה
    const displayItems = [];
    const totalStores = storeChains.length;
    
    // הוספה של מספיק פריטים כדי למלא את כל החלון הנראה
    // ולמנוע חללים ריקים
    for (let i = 0; i < totalStores; i++) {
      const realIndex = (currentIndex + i) % totalStores;
      displayItems.push({
        ...storeChains[realIndex],
        key: `store-${realIndex}-${i}`
      });
    }
    
    return displayItems;
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
