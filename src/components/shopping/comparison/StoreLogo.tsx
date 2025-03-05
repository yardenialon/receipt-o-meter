
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { normalizeChainName } from "@/utils/shopping/storeNameUtils"; 

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

  // Normalize the store name for consistent matching
  const normalizedStoreName = normalizeChainName(storeName);

  // Get fallback logo URL based on chain name
  const getFallbackLogoUrl = () => {
    // Define standard chain-id based fallback paths
    const chainMap: Record<string, string> = {
      'רמי לוי': '/lovable-uploads/rami-levy-logo.png',
      'שופרסל': '/lovable-uploads/shufersal-logo.png',
      'יינות ביתן': '/lovable-uploads/yeinot-bitan-logo.png',
      'ויקטורי': '/lovable-uploads/victory-logo.png',
      'יוחננוף': '/lovable-uploads/yochananof-logo.png',
      'מחסני השוק': '/lovable-uploads/machsanei-hashuk-logo.png',
      'אושר עד': '/lovable-uploads/osher-ad-logo.png',
      'חצי חינם': '/lovable-uploads/hatzi-hinam-logo.png',
      'סופר פארם': '/lovable-uploads/super-pharm-logo.png',
      'טיב טעם': '/lovable-uploads/tiv-taam-logo.png',
      'קרפור': '/lovable-uploads/carrefour-logo.png',
      'קשת טעמים': '/lovable-uploads/keshet-teamim-logo.png',
      'סופר יהודה': '/lovable-uploads/super-yehuda-logo.png',
      'פרש מרקט': '/lovable-uploads/fresh-market-logo.png'
    };
    
    // Return the chain-specific fallback or a generic placeholder
    return chainMap[normalizedStoreName] || 
           `https://via.placeholder.com/100x100?text=${encodeURIComponent(normalizedStoreName)}`;
  };

  // Helper to check if URL is valid and should be attempted
  const shouldAttemptImageLoad = (url?: string | null): boolean => {
    if (!url) return false;
    
    // Check if it's a valid URL format or a relative path
    try {
      if (url.startsWith('/')) {
        return true;
      }
      
      new URL(url);
      return true;
    } catch (e) {
      console.log(`Invalid URL format for ${normalizedStoreName}: ${url}`);
      return false;
    }
  };

  // Normalize URL path
  const normalizeUrl = (url: string): string => {
    // If it's already a lovable-uploads URL, return as is
    if (url.includes('/lovable-uploads/')) {
      return url;
    }
    
    // If it has no path prefix but is a relative path, add slash
    if (!url.startsWith('/') && !url.startsWith('http')) {
      return '/' + url;
    }
    
    return url;
  };

  // Use provided URL first, then fallback to chain-specific logo
  const logoSrc = (!imgError && shouldAttemptImageLoad(logoUrl)) 
    ? normalizeUrl(logoUrl as string)
    : getFallbackLogoUrl();

  return (
    <img 
      src={logoSrc}
      alt={`${normalizedStoreName} logo`}
      className={cn("object-contain", className)}
      onError={(e) => {
        console.error(`Failed to load logo for ${normalizedStoreName} from URL: ${logoSrc}, falling back to chain-specific logo`);
        setImgError(true);
      }}
    />
  );
};
