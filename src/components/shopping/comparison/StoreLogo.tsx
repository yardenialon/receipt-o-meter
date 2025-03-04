
import { cn } from "@/lib/utils";

interface StoreLogoProps {
  storeName: string;
  className?: string;
  logoUrl?: string | null;
}

export const StoreLogo = ({ storeName, className, logoUrl }: StoreLogoProps) => {
  const getLogo = (name: string) => {
    const normalizedName = name.toLowerCase().trim();
    
    // Basic chains
    if (normalizedName.includes('רמי לוי') || normalizedName.includes('rami levy')) {
      return '/lovable-uploads/34a32c41-1c66-475d-9801-5cf24750a931.png';
    }
    
    if (normalizedName.includes('carrefour') || normalizedName.includes('קרפור')) {
      return '/lovable-uploads/f8ee6e35-8e69-4cfb-a8d3-3d187c046d15.png';
    }
    
    if (normalizedName.includes('shufersal') || normalizedName.includes('שופרסל')) {
      return '/lovable-uploads/796394e4-6471-452f-aa58-53d715e4baf2.png';
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
      return '/lovable-uploads/6d595a6f-bf31-4435-a836-9f0adb259348.png';
    }
    
    // New additions
    if (normalizedName.includes('mishnat yosef') || normalizedName.includes('משנת יוסף')) {
      return '/lovable-uploads/d212e399-fe14-4151-ab24-c7428d85e3d4.png';
    }
    
    if (normalizedName.includes('tiv taam') || normalizedName.includes('טיב טעם')) {
      return '/lovable-uploads/35b5cbc9-75d7-4c79-8e56-7cd2e643af41.png';
    }
    
    if (normalizedName.includes('hatzi hinam') || normalizedName.includes('חצי חינם')) {
      return '/lovable-uploads/aa066a09-13b1-4652-80be-10ca0aae90c4.png';
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
      }}
    />
  );
};
