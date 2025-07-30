
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StoreLogoProps {
  storeName: string;
  className?: string;
  logoUrl?: string | null;
}

export const StoreLogo = ({ storeName, className, logoUrl }: StoreLogoProps) => {
  const [imageError, setImageError] = useState(false);
  
  const getLogo = (name: string) => {
    const normalizedName = name.toLowerCase().trim();
    
    if (normalizedName.includes('רמי לוי') || normalizedName.includes('rami levy')) {
      return '/lovable-uploads/34a32c41-1c66-475d-9801-5cf24750a931.png';
    }
    
    if (normalizedName.includes('carrefour') || normalizedName.includes('קרפור')) {
      return '/lovable-uploads/d81dbda8-194c-49d2-93fe-4cfbe17c10db.png';
    }
    
    if (normalizedName.includes('shufersal') || normalizedName.includes('שופרסל')) {
      return '/lovable-uploads/978e1e86-3aa9-4d9d-a9a1-56b56d8eebdf.png';
    }

    if (normalizedName.includes('machsanei') || normalizedName.includes('מחסני השוק')) {
      return '/lovable-uploads/b04d4ae7-290f-4bfb-a8b2-4a9da2b16011.png';
    }

    if (normalizedName.includes('victory') || normalizedName.includes('ויקטורי')) {
      return '/lovable-uploads/47caafa9-5d58-4739-92d8-8fa9b7fd5e3c.png';
    }

    if (normalizedName.includes('yochananof') || normalizedName.includes('יוחננוף')) {
      return '/lovable-uploads/f7131837-8dd8-4e66-947a-54a1b9c7ebb4.png';
    }
    
    if (normalizedName.includes('yeinot bitan') || normalizedName.includes('יינות ביתן')) {
      return '/lovable-uploads/f86638e1-48b0-4005-9df5-fbebc92daa6b.png';
    }

    if (normalizedName.includes('אושר עד') || normalizedName.includes('osher ad')) {
      return '/lovable-uploads/54e06c3b-7d13-4823-a702-1046b8339dcc.png';
    }

    if (normalizedName.includes('סופר פארם') || normalizedName.includes('super pharm') || normalizedName.includes('super-pharm')) {
      return '/lovable-uploads/super-pharm-logo.png';
    }

    if (normalizedName.includes('חצי חינם') || normalizedName.includes('hatzi hinam')) {
      return '/lovable-uploads/hatzi-hinam-logo.png';
    }

    if (normalizedName.includes('פוליצר') || normalizedName.includes('politzer')) {
      return '/lovable-uploads/politzer-logo.png';
    }

    if (normalizedName.includes('זול בשפע') || normalizedName.includes('zol beshefa')) {
      return '/lovable-uploads/zol-beshefa-logo.png';
    }

    if (normalizedName.includes('משולם') || normalizedName.includes('meshulam')) {
      return '/lovable-uploads/meshulam-logo.png';
    }

    if (normalizedName.includes('סטופ מרקט') || normalizedName.includes('stop market')) {
      return '/lovable-uploads/stop-market-logo.png';
    }
    
    return logoUrl || null;
  };

  const logo = getLogo(storeName);
  
  if (!logo || imageError) {
    // Return a fallback UI when no logo is available or if there was an error loading the image
    return (
      <div className={cn("h-6 w-auto flex items-center justify-center text-xs text-gray-500 rounded bg-gray-100 px-2", className)}>
        {storeName}
      </div>
    );
  }

  return (
    <img 
      src={logo} 
      alt={`${storeName} logo`}
      className={cn("h-6 w-auto object-contain", className)}
      onError={() => setImageError(true)}
    />
  );
};
