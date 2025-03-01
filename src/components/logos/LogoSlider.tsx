
import { useRef } from 'react';
import { motion } from 'framer-motion';
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
    getDisplayItems, 
    showControls 
  } = useLogoSlider();

  // החזרת הפריטים לתצוגה
  const displayItems = getDisplayItems();

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
          className="overflow-hidden mx-10 w-full"
        >
          <motion.div 
            className="flex items-center gap-6"
            initial={false}
            animate={{ 
              x: `calc(-${(currentIndex * 100) / visibleLogos}%)` 
            }}
            transition={{ 
              ease: "easeInOut", 
              duration: 1.0 
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
