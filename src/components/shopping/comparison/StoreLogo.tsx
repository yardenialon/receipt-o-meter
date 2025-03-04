
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface StoreLogoProps {
  storeName: string;
  className?: string;
  logoUrl?: string | null;
}

export const StoreLogo = ({ storeName, className, logoUrl }: StoreLogoProps) => {
  const [imgError, setImgError] = useState(false);
  
  // Reset the error state when logoUrl changes
  useEffect(() => {
    if (logoUrl) {
      setImgError(false);
    }
  }, [logoUrl]);

  // Get a generic logo placeholder URL
  const getGenericLogoUrl = () => {
    return `https://via.placeholder.com/100x100?text=${encodeURIComponent(storeName)}`;
  };

  // Helper to check if URL is valid and should be attempted
  const shouldAttemptImageLoad = (url?: string | null): boolean => {
    if (!url) return false;
    
    // Check if it's a valid URL format and not a placeholder
    try {
      const urlObj = new URL(url);
      console.log(`Valid URL format for ${storeName}: ${url}`);
      
      // If URL is from placeholder.com, it's already a fallback
      if (urlObj.hostname === 'via.placeholder.com') {
        console.log(`Using placeholder URL for ${storeName}`);
      }
      
      return true;
    } catch (e) {
      console.log(`Invalid URL format for ${storeName}: ${url}`);
      return false;
    }
  };

  const logoSrc = !imgError && shouldAttemptImageLoad(logoUrl) 
    ? logoUrl 
    : getGenericLogoUrl();

  console.log(`StoreLogo render for ${storeName}:`, { 
    originalUrl: logoUrl, 
    hasError: imgError, 
    finalSrc: logoSrc 
  });

  return (
    <img 
      src={logoSrc}
      alt={`${storeName} logo`}
      className={cn("object-contain", className)}
      onError={() => {
        console.error(`Failed to load logo for ${storeName} from URL: ${logoUrl}, using placeholder instead`);
        setImgError(true);
      }}
    />
  );
};
