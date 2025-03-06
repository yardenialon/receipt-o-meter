
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

  // Use provided URL first, then fallback to chain-specific logo
  const logoSrc = (!imgError && logoUrl) 
    ? logoUrl 
    : getFallbackLogoUrl();

  console.log(`Rendering logo for ${normalizedStoreName}:`, { logoUrl, logoSrc, imgError });

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
