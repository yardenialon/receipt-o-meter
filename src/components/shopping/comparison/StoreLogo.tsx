
import { cn } from "@/lib/utils";

interface StoreLogoProps {
  storeName: string;
  className?: string;
  logoUrl?: string | null;
}

export const StoreLogo = ({ storeName, className, logoUrl }: StoreLogoProps) => {
  const getLogo = (name: string) => {
    const normalizedName = name.toLowerCase().trim();
    
    // Basic chains - using direct public paths instead of lovable-uploads paths
    if (normalizedName.includes('רמי לוי') || normalizedName.includes('rami levy')) {
      return '/store-logos/rami-levy.png';
    }
    
    if (normalizedName.includes('carrefour') || normalizedName.includes('קרפור')) {
      return '/store-logos/carrefour.png';
    }
    
    if (normalizedName.includes('shufersal') || normalizedName.includes('שופרסל')) {
      return '/store-logos/shufersal.png';
    }

    if (normalizedName.includes('machsanei') || normalizedName.includes('מחסני השוק')) {
      return '/store-logos/machsanei-hashuk.png';
    }

    if (normalizedName.includes('victory') || normalizedName.includes('ויקטורי')) {
      return '/store-logos/victory.png';
    }

    if (normalizedName.includes('yochananof') || normalizedName.includes('יוחננוף')) {
      return '/store-logos/yochananof.png';
    }
    
    if (normalizedName.includes('yeinot bitan') || normalizedName.includes('יינות ביתן')) {
      return '/store-logos/yeinot-bitan.png';
    }
    
    // New additions
    if (normalizedName.includes('mishnat yosef') || normalizedName.includes('משנת יוסף')) {
      return '/store-logos/mishnat-yosef.png';
    }
    
    if (normalizedName.includes('tiv taam') || normalizedName.includes('טיב טעם')) {
      return '/store-logos/tiv-taam.png';
    }
    
    if (normalizedName.includes('hatzi hinam') || normalizedName.includes('חצי חינם')) {
      return '/store-logos/hatzi-hinam.png';
    }

    // Add more specific fallbacks for common chains
    if (normalizedName.includes('super')) {
      return '/store-logos/shufersal.png'; // Placeholder for supermarket
    }
    
    // Fallback to an icon if no logo is found
    if (logoUrl) return logoUrl;
    
    // Default placeholder logo
    return '/placeholder.svg';
  };

  const logo = getLogo(storeName);

  return (
    <img 
      src={logo} 
      alt={`${storeName} logo`}
      className={cn("h-6 w-auto object-contain", className)}
      onError={(e) => {
        // Fallback to placeholder if image fails to load
        e.currentTarget.src = '/placeholder.svg';
        console.log(`Failed to load logo for ${storeName}, using placeholder instead`);
      }}
    />
  );
};
