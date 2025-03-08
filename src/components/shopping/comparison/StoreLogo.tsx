
import { cn } from "@/lib/utils";

interface StoreLogoProps {
  storeName: string;
  className?: string;
  logoUrl?: string | null;
}

export const StoreLogo = ({ storeName, className, logoUrl }: StoreLogoProps) => {
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
      return '/lovable-uploads/f26b4523-2f66-4954-9867-d146917d68a0.png';
    }
    
    return logoUrl || null;
  };

  const logo = getLogo(storeName);
  
  if (!logo) return null;

  return (
    <img 
      src={logo} 
      alt={`${storeName} logo`}
      className={cn("h-6 w-auto object-contain", className)}
    />
  );
};
