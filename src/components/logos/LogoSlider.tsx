
import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLogoSlider } from './hooks/useLogoSlider';
import { LogoItem } from './LogoItem';

export function LogoSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    visibleLogos, 
    goToNext, 
    goToPrev, 
    getDisplayItems, 
    showControls,
    isLoading
  } = useLogoSlider();

  // Get display items
  const displayItems = getDisplayItems();
  
  // Add debug logging
  useEffect(() => {
    console.log('LogoSlider rendered with:', { 
      displayItems, 
      itemCount: displayItems.length,
      visibleLogos
    });
  }, [displayItems, visibleLogos]);

  if (isLoading) {
    return <div className="py-4 flex justify-center">טוען נתונים...</div>;
  }
  
  if (displayItems.length === 0) {
    return <div className="py-4 flex justify-center">אין רשתות להצגה</div>;
  }

  return (
    <div className="relative py-4">
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
          <div className="flex justify-center">
            {displayItems.map((store) => (
              <LogoItem 
                key={store.key} 
                store={store} 
                visibleLogos={visibleLogos} 
              />
            ))}
          </div>
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
