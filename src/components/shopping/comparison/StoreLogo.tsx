
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { normalizeChainName } from "@/utils/shopping/storeNameUtils"; 
import { useStoreChainInfo } from "@/hooks/comparison/useStoreInfo";

interface StoreLogoProps {
  storeName: string;
  className?: string;
  logoUrl?: string | null;
}

export const StoreLogo = ({ storeName, className, logoUrl }: StoreLogoProps) => {
  const [imgError, setImgError] = useState(false);
  
  // Fetch store chain info from database
  const { data: chainInfo, isLoading } = useStoreChainInfo();
  
  // Normalize the store name for consistent matching
  const normalizedStoreName = normalizeChainName(storeName);
  
  // Reset the error state when logoUrl changes
  useEffect(() => {
    setImgError(false);
  }, [logoUrl, chainInfo]);

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

  // Determine the logo URL to use
  let logoSrc;
  
  // First try to use the provided logoUrl (highest priority)
  if (logoUrl && !imgError) {
    logoSrc = logoUrl;
  } 
  // Then check if we have a logo for this chain in our database
  else if (chainInfo && chainInfo[normalizedStoreName]?.logoUrl && !imgError) {
    logoSrc = chainInfo[normalizedStoreName].logoUrl;
  } 
  // Fall back to placeholder if no logo is available or if loading failed
  else {
    logoSrc = generatePlaceholderUrl(normalizedStoreName);
  }

  return (
    <img 
      src={logoSrc}
      alt={`${normalizedStoreName} logo`}
      className={cn("object-contain", className)}
      onError={() => {
        console.error(`Failed to load logo for ${normalizedStoreName}`);
        setImgError(true);
      }}
    />
  );
};
