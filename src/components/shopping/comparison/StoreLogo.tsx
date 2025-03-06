
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { normalizeChainName } from "@/utils/shopping/storeNameUtils"; 

interface StoreLogoProps {
  storeName: string;
  className?: string;
  logoUrl?: string | null;
}

// Since we're encountering 404s for the previously "confirmed" logos,
// We'll use placeholders for all logos until we have actual images
const CONFIRMED_LOGOS: Record<string, string> = {};

export const StoreLogo = ({ storeName, className, logoUrl }: StoreLogoProps) => {
  const [imgError, setImgError] = useState(false);
  
  // Reset the error state when logoUrl changes
  useEffect(() => {
    if (logoUrl) {
      setImgError(false);
    }
  }, [logoUrl]);

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

  // Check if we have a confirmed logo for this store
  const hasConfirmedLogo = normalizedStoreName in CONFIRMED_LOGOS;

  // Only use real logo URLs for confirmed logos, otherwise go straight to placeholder
  // This prevents unnecessary 404 errors for non-existent logo files
  let logoSrc;
  
  if (hasConfirmedLogo) {
    logoSrc = CONFIRMED_LOGOS[normalizedStoreName];
  } else if (logoUrl && logoUrl.startsWith('http')) {
    // Only use logoUrl if it's an actual URL (not a path)
    logoSrc = !imgError ? logoUrl : generatePlaceholderUrl(normalizedStoreName);
  } else {
    // For all other cases, use placeholder
    logoSrc = generatePlaceholderUrl(normalizedStoreName);
  }

  const handleImageError = () => {
    console.error(`Failed to load logo for ${normalizedStoreName} from URL: ${logoSrc}`);
    setImgError(true);
  };

  return (
    <img 
      src={imgError ? generatePlaceholderUrl(normalizedStoreName) : logoSrc}
      alt={`${normalizedStoreName} logo`}
      className={cn("object-contain", className)}
      onError={handleImageError}
    />
  );
};
