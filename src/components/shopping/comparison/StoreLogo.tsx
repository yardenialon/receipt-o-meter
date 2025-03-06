import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { normalizeChainName } from "@/utils/shopping/storeNameUtils"; 

interface StoreLogoProps {
  storeName: string;
  className?: string;
  logoUrl?: string | null;
}

// List of stores with confirmed existing logos
const CONFIRMED_LOGOS: Record<string, string> = {
  'שופרסל': '/lovable-uploads/7f874da2-c327-4a3b-aec1-53f8a0b28a1c.png',
  'טיב טעם': '/lovable-uploads/bee996f5-ef8f-434b-8d0b-04e7b6ce37b9.png'
};

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

  // Get the appropriate logo URL
  const getLogoUrl = () => {
    // First check if we have a confirmed logo
    if (hasConfirmedLogo) {
      return CONFIRMED_LOGOS[normalizedStoreName];
    }
    
    // Otherwise use the provided URL
    return logoUrl;
  };

  // For fallback, always use the placeholder for stores without confirmed logos
  const logoSrc = (!imgError && getLogoUrl()) 
    ? getLogoUrl() 
    : generatePlaceholderUrl(normalizedStoreName);

  // Only log for debugging when there's an actual error
  const handleImageError = () => {
    // Only log errors for URLs we expected to work
    if (hasConfirmedLogo || logoUrl) {
      console.error(`Failed to load logo for ${normalizedStoreName} from URL: ${getLogoUrl()}`);
    }
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
