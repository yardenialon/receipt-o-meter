
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLogoSlider } from './hooks/useLogoSlider';
import { LogoItem } from './LogoItem';

export function LogoSlider() {
  const { 
    currentIndex, 
    visibleLogos, 
    goToNext, 
    goToPrev, 
    displayItems,
    showControls,
    isAnimating
  } = useLogoSlider();

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

        <div className="overflow-hidden mx-10 w-full">
          <motion.div 
            className="flex items-center"
            animate={{ 
              x: `calc(-${currentIndex * (100 / visibleLogos)}%)`,
            }}
            transition={{ 
              ease: "easeInOut", 
              duration: isAnimating ? 0.3 : 0,
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
