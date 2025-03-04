
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
      // קידום רגיל, עם טיפול במעבר חלק בין סופו של המערך לתחילתו
      return (prevIndex + 1) % storeChains.length;
    });
  };

  const goToPrev = () => {
    if (!storeChains || storeChains.length <= visibleLogos) return;
    
    setCurrentIndex((prevIndex) => {
      // נסיגה אחורה, עם טיפול במעבר חלק בין תחילת המערך לסופו
      return (prevIndex - 1 + storeChains.length) % storeChains.length;
    });
  };

  // הפעלת הסליידר אוטומטית באופן מתון
  useEffect(() => {
    if (!storeChains || storeChains.length <= visibleLogos) return;
    
    const interval = setInterval(() => {
      goToNext();
    }, 3000); // 3 שניות לגלילה

    return () => clearInterval(interval);
  }, [visibleLogos, storeChains, goToNext]);

  // יצירת מערך עזר לתצוגה חלקה ולופית של הלוגואים
  const getDisplayItems = () => {
    if (!storeChains || storeChains.length === 0) return [];
    
    // מספר הפריטים המינימלי שצריך להציג לפני ואחרי כדי למנוע חללים ריקים
    const additionalItems = visibleLogos;
    
    let items = [];
    
    // הוספת פריטים מהסוף להתחלה (לטיפול בגלילה אחורה)
    for (let i = additionalItems; i > 0; i--) {
      const idx = (currentIndex - i + storeChains.length) % storeChains.length;
      items.push({...storeChains[idx], key: `pre-${idx}`});
    }
    
    // הוספת הפריטים הנוכחיים
    for (let i = 0; i < storeChains.length; i++) {
      const idx = (currentIndex + i) % storeChains.length;
      items.push({...storeChains[idx], key: `main-${idx}`});
    }
    
    // הוספת פריטים מההתחלה (כולל הפריט הראשון) כדי ליצור לופ חלק
    // הוספת מספיק פריטים כדי למנוע רווחים בקצוות
    for (let i = 0; i < additionalItems; i++) {
      const idx = (currentIndex + storeChains.length + i) % storeChains.length;
      items.push({...storeChains[idx], key: `post-${idx}`});
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
