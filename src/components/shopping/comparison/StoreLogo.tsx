
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

  // Check if we should use a hardcoded path for common stores
  const getHardcodedLogoPath = (name: string): string | null => {
    // Normalize the store name (trim whitespace and lowercase)
    const normalizedName = name.trim().toLowerCase();
    
    // Map of store names to their image files
    const storeLogos: Record<string, string> = {
      'רמי לוי': '/lovable-uploads/f7131837-8dd8-4e66-947a-54a1b9c7ebb4.png',
      'שופרסל': '/lovable-uploads/d93c25df-9c2b-4fa3-ab6d-e0cb1b47de5d.png',
      'יינות ביתן': '/lovable-uploads/f86638e1-48b0-4005-9df5-fbebc92daa6b.png',
      'ויקטורי': '/lovable-uploads/83f1c27e-8de1-4b8c-83c1-d807211c28d9.png',
      'יוחננוף': '/lovable-uploads/978e1e86-3aa9-4d9d-a9a1-56b56d8eebdf.png',
      'מחסני השוק': '/lovable-uploads/7382a403-382f-4b83-a2d2-50854e4f83d7.png',
      'אושר עד': '/lovable-uploads/1f5589fb-c108-45ce-b235-a61909f72471.png',
      'חצי חינם': '/lovable-uploads/1dc47ba7-26f0-461e-9822-5e477bd5ed31.png',
      'סופר פארם': '/lovable-uploads/34a32c41-1c66-475d-9801-5cf24750a931.png',
      'טיב טעם': '/lovable-uploads/07a1d83a-7044-4aa8-9501-18010ad22ff6.png',
      'קרפור': '/lovable-uploads/47caafa9-5d58-4739-92d8-8fa9b7fd5e3c.png',
    };
    
    // Check for exact matches first
    if (storeLogos[name]) {
      console.log(`Found exact logo match for ${name}: ${storeLogos[name]}`);
      return storeLogos[name];
    }
    
    // Then check for fuzzy matches (if the name includes the key or vice versa)
    for (const [key, value] of Object.entries(storeLogos)) {
      if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
        console.log(`Found fuzzy logo match for ${name} using ${key}: ${value}`);
        return value;
      }
    }
    
    console.log(`No hardcoded logo found for ${name}`);
    return null;
  };

  // Get a generic logo placeholder URL
  const getGenericLogoUrl = () => {
    return `https://via.placeholder.com/100x100?text=${encodeURIComponent(storeName)}`;
  };

  // Helper to check if URL is valid and should be attempted
  const shouldAttemptImageLoad = (url?: string | null): boolean => {
    if (!url) return false;
    
    // Check if it's a valid URL format
    try {
      // Check if the URL is a relative path starting with /
      if (url.startsWith('/')) {
        console.log(`Using relative path for ${storeName}: ${url}`);
        return true;
      }
      
      const urlObj = new URL(url);
      console.log(`Valid URL format for ${storeName}: ${url}`);
      return true;
    } catch (e) {
      console.log(`Invalid URL format for ${storeName}: ${url}`);
      return false;
    }
  };

  // Use hardcoded path first, then provided URL, then fallback to placeholder
  const hardcodedLogo = getHardcodedLogoPath(storeName);
  const logoSrc = hardcodedLogo || (!imgError && shouldAttemptImageLoad(logoUrl) 
    ? logoUrl 
    : getGenericLogoUrl());

  console.log(`StoreLogo render for ${storeName}:`, { 
    originalUrl: logoUrl, 
    hardcodedLogo,
    hasError: imgError, 
    finalSrc: logoSrc 
  });

  return (
    <img 
      src={logoSrc}
      alt={`${storeName} logo`}
      className={cn("object-contain", className)}
      onError={() => {
        console.error(`Failed to load logo for ${storeName} from URL: ${logoSrc}, using placeholder instead`);
        setImgError(true);
      }}
    />
  );
};
