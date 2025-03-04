
import { cn } from "@/lib/utils";

interface StoreLogoProps {
  storeName: string;
  className?: string;
  logoUrl?: string | null;
}

export const StoreLogo = ({ storeName, className, logoUrl }: StoreLogoProps) => {
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
  
  const normalizedName = storeName.toLowerCase().trim();
  const logoPlaceholder = (
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

  // Check if there's a direct logoUrl provided
  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt={`${storeName} logo`}
        className={cn("h-6 w-auto object-contain", className)}
        onError={() => console.log(`Failed to load custom logo for ${storeName}`)}
      />
    );
  }

  // Return the placeholder for all stores
  return logoPlaceholder;
};
