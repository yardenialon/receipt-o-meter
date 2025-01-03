import { cn } from "@/lib/utils";

interface StoreLogoProps {
  storeName: string;
  className?: string;
}

export const StoreLogo = ({ storeName, className }: StoreLogoProps) => {
  const getLogo = (name: string) => {
    const normalizedName = name.toLowerCase().trim();
    
    if (normalizedName.includes('carrefour') || normalizedName.includes('קרפור')) {
      return '/lovable-uploads/f86638e1-48b0-4005-9df5-fbebc92daa6b.png';
    }
    
    if (normalizedName.includes('shufersal') || normalizedName.includes('שופרסל')) {
      return '/lovable-uploads/978e1e86-3aa9-4d9d-a9a1-56b56d8eebdf.png';
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