
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLogoSlider } from './hooks/useLogoSlider';
import { LogoItem } from './LogoItem';

export function LogoSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    currentIndex, 
    visibleLogos, 
    goToNext, 
    goToPrev, 
    displayItems,
    showControls,
    isAnimating
  } = useLogoSlider();
  
  // נוודא שהסליידר ממוקם נכון כשמשתנה האינדקס
  useEffect(() => {
    // עדכון מיקום כשמשתנה האינדקס
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(0)`;
    }
  }, [currentIndex]);

  return (
    <div className="relative py-6">
      <div className="flex items-center justify-between">
        {showControls && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full absolute left-0 z-10 opacity-90 shadow-sm hover:opacity-100"
            onClick={goToPrev}
            disabled={isAnimating}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        <div 
          ref={containerRef}
          className="overflow-hidden mx-10 w-full"
        >
          <AnimatePresence initial={false}>
            <motion.div 
              className="flex items-center"
              initial={false}
              animate={{ 
                x: `calc(-${currentIndex * (100 / visibleLogos)}%)`,
              }}
              transition={{ 
                ease: "easeInOut", 
                duration: 0.5
              }}
            >
              {displayItems.map((store) => (
                <LogoItem 
                  key={store.key} 
                  store={store} 
                  visibleLogos={visibleLogos} 
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {showControls && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full absolute right-0 z-10 opacity-90 shadow-sm hover:opacity-100"
            onClick={goToNext}
            disabled={isAnimating}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
