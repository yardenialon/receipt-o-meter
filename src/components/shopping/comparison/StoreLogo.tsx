import { cn } from "@/lib/utils";

interface StoreLogoProps {
  storeName: string;
  className?: string;
}

export const StoreLogo = ({ storeName, className }: StoreLogoProps) => {
  const getLogo = (name: string) => {
    const normalizedName = name.toLowerCase().trim();
    
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
    
    return null;
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