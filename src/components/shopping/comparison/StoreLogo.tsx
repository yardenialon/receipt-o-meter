
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { normalizeChainName, getStoreLogo } from "@/utils/shopping/storeNameUtils"; 

interface StoreLogoProps {
  storeName: string;
  className?: string;
  logoUrl?: string | null;
}

export const StoreLogo = ({ storeName, className, logoUrl }: StoreLogoProps) => {
  const [imgError, setImgError] = useState(false);
  
  // Normalize the store name for consistent matching
  const normalizedStoreName = normalizeChainName(storeName);
  
  // Reset the error state when logoUrl changes
  useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

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
    
    // Create the placeholder URL with initials
    return `https://placehold.co/100x100/${bgColor}/FFFFFF/svg?text=${encodeURIComponent(initials)}`;
  };

  // Function to ensure the logo path is correct
  const getCorrectLogoPath = (path: string | null) => {
    if (!path) return null;
    
    // If it's already a full URL, return as is
    if (path.startsWith('http')) return path;
    
    // Remove leading slash if present to use as relative path
    return path.replace(/^\//, '');
  };

  // Determine the logo URL to use (priority order)
  let logoSrc;
  
  // 1. First try to use the provided logoUrl (highest priority)
  if (logoUrl && !imgError) {
    logoSrc = getCorrectLogoPath(logoUrl);
    console.log(`Using provided logoUrl for ${normalizedStoreName}:`, logoSrc);
  } 
  // 2. Then try to use our predefined logos mapping
  else {
    const mappedLogo = getStoreLogo(normalizedStoreName);
    if (mappedLogo && !imgError) {
      logoSrc = getCorrectLogoPath(mappedLogo);
      console.log(`Using mapped logo for ${normalizedStoreName}:`, logoSrc);
    } 
    // 3. Fall back to placeholder if no logo is available or if loading failed
    else {
      logoSrc = generatePlaceholderUrl(normalizedStoreName);
      console.log(`Using placeholder for ${normalizedStoreName}:`, logoSrc);
    }
  }

  return (
    <img 
      src={logoSrc}
      alt={`${normalizedStoreName} logo`}
      className={cn("object-contain", className)}
      onError={() => {
        console.error(`Failed to load logo for ${normalizedStoreName}`, logoSrc);
        setImgError(true);
      }}
    />
  );
};
