
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
    return "https://via.placeholder.com/100x100?text=" + encodeURIComponent(storeName);
  };

  // Always attempt to render a logo image
  return (
    <img 
      src={imgError || !logoUrl ? getGenericLogoUrl() : logoUrl} 
      alt={`${storeName} logo`}
      className={cn("object-contain", className)}
      onError={() => {
        console.log(`Failed to load logo for ${storeName} from URL: ${logoUrl}, using placeholder instead`);
        setImgError(true);
      }}
    />
  );
};
