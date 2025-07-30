
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
      return '/lovable-uploads/e83879f3-3038-4340-a0c5-1f943395991c.png';
    }

    if (normalizedName.includes('פוליצר') || normalizedName.includes('politzer')) {
      return '/lovable-uploads/469ec827-3362-432b-8f2c-9e48418e4c70.png';
    }

    if (normalizedName.includes('זול בשפע') || normalizedName.includes('zol beshefa')) {
      return '/lovable-uploads/zol-beshefa-logo.png';
    }

    if (normalizedName.includes('משולם') || normalizedName.includes('meshulam')) {
      return '/lovable-uploads/meshulam-logo.png';
    }

    if (normalizedName.includes('טיב טעם') || normalizedName.includes('tiv taam')) {
      return '/lovable-uploads/a991a6dc-4b2d-4ae6-a0c4-296a1b1897c6.png';
    }

    if (normalizedName.includes('היפר כהן') || normalizedName.includes('hyper cohen')) {
      return '/lovable-uploads/f2514311-f352-48ca-b31b-ef133d0141fe.png';
    }

    if (normalizedName.includes('סיטי מרקט') || normalizedName.includes('city market 24/7')) {
      return '/lovable-uploads/91af728b-7c1e-49c9-854d-29f10d0d0d91.png';
    }

    if (normalizedName.includes('סופר ספיר') || normalizedName.includes('super sapir')) {
      return '/lovable-uploads/a47b048f-bac8-452c-b971-8bfbe1fc11c6.png';
    }

    if (normalizedName.includes('שוק העיר') || normalizedName.includes('shuk hair') || normalizedName.includes('city market')) {
      return '/lovable-uploads/c6f83730-c2ed-47f1-a315-15be98c22e37.png';
    }

    if (normalizedName.includes('ברקת') || normalizedName.includes('bareket') || normalizedName.includes('barkat')) {
      return '/lovable-uploads/e4049ec6-07eb-4a2d-a1f2-b876ca07bf8a.png';
    }

    if (normalizedName.includes('פרש מרקט') || normalizedName.includes('fresh market')) {
      return '/lovable-uploads/5230cdeb-1694-414c-8492-c274e00e832b.png';
    }

    if (normalizedName.includes('סופר יהודה') || normalizedName.includes('super yehuda')) {
      return '/lovable-uploads/c96e0609-02fc-412d-9c45-41dd33d7f99b.png';
    }

    if (normalizedName.includes('קשת טעמים') || normalizedName.includes('keshet teamim')) {
      return '/lovable-uploads/354d0777-8fc3-4c11-b4d9-25b8c5589ada.png';
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
