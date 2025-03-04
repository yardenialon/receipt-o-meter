import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface StoreLogoProps {
  storeName: string;
  className?: string;
  logoUrl?: string | null;
}

export const StoreLogo = ({ storeName, className, logoUrl }: StoreLogoProps) => {
  const [showPlaceholder, setShowPlaceholder] = useState(!logoUrl);
  const [imgError, setImgError] = useState(false);

  // Reset the error state when logoUrl changes
  useEffect(() => {
    if (logoUrl) {
      setShowPlaceholder(false);
      setImgError(false);
    } else {
      setShowPlaceholder(true);
    }
  }, [logoUrl]);

  // Default color for store initials
  const getInitialBgColor = (name: string) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", 
      "bg-pink-500", "bg-yellow-500", "bg-indigo-500",
      "bg-red-500", "bg-teal-500", "bg-orange-500"
    ];
    
    // Simple hash function to get consistent color for a name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Get store initials (up to 2 characters)
  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return name.substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  };
  
  // Create the placeholder with initials
  const renderPlaceholder = () => (
    <div className={cn(
      "flex items-center justify-center rounded-full",
      getInitialBgColor(storeName),
      className || "h-6 w-6"
    )}>
      <span className="text-white font-bold text-xs">
        {getInitials(storeName)}
      </span>
    </div>
  );

  // If we should show the placeholder or if there's an error, render the placeholder
  if (showPlaceholder || imgError) {
    return renderPlaceholder();
  }
  
  // Otherwise, attempt to render the logo
  return (
    <img 
      src={logoUrl || ''} 
      alt={`${storeName} logo`}
      className={cn("object-contain", className)}
      onError={() => {
        console.log(`Failed to load logo for ${storeName} from URL: ${logoUrl}, using placeholder instead`);
        setImgError(true);
        setShowPlaceholder(true);
      }}
    />
  );
};
