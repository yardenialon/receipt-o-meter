
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { normalizeChainName } from "@/utils/shopping/storeNameUtils"; 

interface StoreLogoProps {
  storeName: string;
  className?: string;
  logoUrl?: string | null;
}

// Map of confirmed logos with their standard file name pattern
const STORE_LOGOS: Record<string, string> = {
  'רמי לוי': '/store-logos/rami-levy.png',
  'שופרסל': '/store-logos/shufersal.png',
  'יוחננוף': '/store-logos/yochananof.png',
  'טיב טעם': '/store-logos/tiv-taam.png',
  'חצי חינם': '/store-logos/hatzi-hinam.png',
  'אושר עד': '/store-logos/osher-ad.png',
  'ויקטורי': '/store-logos/victory.png',
  'יינות ביתן': '/store-logos/yeinot-bitan.png',
  'מחסני השוק': '/store-logos/machsanei-hashuk.png',
  'קרפור': '/store-logos/carrefour.png',
  'סופר פארם': '/store-logos/super-pharm.png',
  'זול ובגדול': '/store-logos/zol-vbgadol.png',
  'משנת יוסף': '/store-logos/mishnat-yosef.png',
  'קינג סטור': '/store-logos/king-store.png',
  'נתיב החסד': '/store-logos/netiv-hachesed.png',
  'פרש מרקט': '/store-logos/fresh-market.png',
  'קשת טעמים': '/store-logos/keshet-teamim.png',
  'סופר יהודה': '/store-logos/super-yehuda.png'
};

export const StoreLogo = ({ storeName, className, logoUrl }: StoreLogoProps) => {
  const [imgError, setImgError] = useState(false);
  
  // Reset the error state when storeName or logoUrl changes
  useEffect(() => {
    setImgError(false);
  }, [storeName, logoUrl]);

  // Normalize the store name for consistent matching
  const normalizedStoreName = normalizeChainName(storeName);

  // Function to generate a colored text-based placeholder
  const generatePlaceholderUrl = (name: string) => {
    // Get first letter or two of the name
    const initials = name.replace(/\s+/g, ' ').trim().split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('');
    
    // Generate a consistent color based on the name
    const colors = [
      'FF6B6B', 'FFD93D', '6BCB77', '4D96FF', 'F473B9', 
      'AA77FF', '9A7B4F', '764AF1', '92C7CF', 'FF9B50'
    ];
    
    // Use a simple hash function to pick a color
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const bgColor = colors[colorIndex];
    
    // Create the placeholder URL
    return `https://placehold.co/100x100/${bgColor}/FFFFFF/svg?text=${encodeURIComponent(initials)}`;
  };

  // Source selection logic (prioritized)
  let logoSrc: string;
  
  if (imgError) {
    // If we've had an error loading the image, use placeholder
    logoSrc = generatePlaceholderUrl(normalizedStoreName);
  } else if (logoUrl && (logoUrl.startsWith('http') || logoUrl.startsWith('/'))) {
    // Use the provided URL if it looks valid (absolute URL or starts with /)
    logoSrc = logoUrl;
  } else if (normalizedStoreName in STORE_LOGOS) {
    // Use our predefined logo mapping if available
    logoSrc = STORE_LOGOS[normalizedStoreName];
  } else {
    // Fallback to placeholder
    logoSrc = generatePlaceholderUrl(normalizedStoreName);
  }

  const handleImageError = () => {
    console.error(`Failed to load logo for ${normalizedStoreName} from URL: ${logoSrc}`);
    
    // If current source is from our mapping and it failed, go straight to placeholder
    if (normalizedStoreName in STORE_LOGOS && logoSrc === STORE_LOGOS[normalizedStoreName]) {
      setImgError(true);
      return;
    }
    
    // If current source is the provided logoUrl and it failed, try our mapping
    if (logoUrl && logoSrc === logoUrl && normalizedStoreName in STORE_LOGOS) {
      logoSrc = STORE_LOGOS[normalizedStoreName];
      // Don't set error yet, let it try our mapping first
      return;
    }
    
    // In all other cases, set error to true to use placeholder
    setImgError(true);
  };

  return (
    <img 
      src={logoSrc}
      alt={`${normalizedStoreName} logo`}
      className={cn("object-contain", className)}
      onError={handleImageError}
    />
  );
};
