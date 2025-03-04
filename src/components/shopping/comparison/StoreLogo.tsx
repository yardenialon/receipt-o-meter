
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
    
    // Check if it's a valid URL format
    try {
      new URL(url);
      return true;
    } catch (e) {
      console.log(`Invalid URL format for ${storeName}: ${url}`);
      return false;
    }
  };

  const logoSrc = !imgError && shouldAttemptImageLoad(logoUrl) 
    ? logoUrl 
    : getGenericLogoUrl();

  return (
    <img 
      src={logoSrc}
      alt={`${storeName} logo`}
      className={cn("object-contain", className)}
      onError={() => {
        console.log(`Failed to load logo for ${storeName} from URL: ${logoUrl}, using placeholder instead`);
        setImgError(true);
      }}
    />
  );
};
