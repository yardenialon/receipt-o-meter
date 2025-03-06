
import { useState, useEffect } from 'react';
import { StoreChain, fetchStoreChains, fallbackStoreChains } from '../utils/storeChainUtils';
import { useQuery } from '@tanstack/react-query';

export function useLogoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleLogos, setVisibleLogos] = useState(5);

  // Fetch store chain data with better error handling
  const { data: storeChains, isLoading } = useQuery({
    queryKey: ['store-chains'],
    queryFn: async () => {
      try {
        const chains = await fetchStoreChains();
        console.log('Fetched store chains:', chains);
        return chains;
      } catch (error) {
        console.error('Error fetching store chains:', error);
        return fallbackStoreChains;
      }
    },
    initialData: fallbackStoreChains,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false
  });

  // Update visible logos based on screen width
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

  // Navigation functions
  const goToNext = () => {
    if (!storeChains || storeChains.length <= visibleLogos) return;
    
    setCurrentIndex((prevIndex) => {
      const maxIndex = storeChains.length - visibleLogos;
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };

  const goToPrev = () => {
    if (!storeChains || storeChains.length <= visibleLogos) return;
    
    setCurrentIndex((prevIndex) => {
      const maxIndex = storeChains.length - visibleLogos;
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
  };

  // Auto-slide functionality
  useEffect(() => {
    if (!storeChains || storeChains.length <= visibleLogos) return;
    
    const interval = setInterval(() => {
      goToNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [visibleLogos, storeChains, currentIndex]);

  // Create array of visible logos with proper key handling
  const getDisplayItems = () => {
    if (!storeChains || storeChains.length === 0) {
      console.log('No store chains to display');
      return [];
    }
    
    const totalToShow = Math.min(visibleLogos, storeChains.length);
    console.log(`Displaying ${totalToShow} logos out of ${storeChains.length} at index ${currentIndex}`);
    
    const result = [];
    for (let i = 0; i < totalToShow; i++) {
      const index = (currentIndex + i) % storeChains.length;
      const store = {
        ...storeChains[index],
        key: `store-${index}-${i}`
      };
      
      // Make sure paths are valid
      if (store.logo_url && !store.logo_url.startsWith('/') && !store.logo_url.startsWith('http')) {
        store.logo_url = '/' + store.logo_url;
      }
      
      result.push(store);
    }
    
    return result;
  };

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
