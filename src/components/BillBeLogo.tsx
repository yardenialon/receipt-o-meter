import React from 'react';
import { cn } from '@/lib/utils';

interface BillBeLogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'icon';
  showTagline?: boolean;
}

export const BillBeLogo = ({ 
  className = "", 
  size = 200, 
  variant = 'full',
  showTagline = false 
}: BillBeLogoProps) => {
  return (
    <div className={cn("inline-flex flex-col items-center", className)}>
      <img 
        src="/lovable-uploads/b1b23f5f-616a-4969-a1b1-b7e10a1338fb.png"
        alt="BillBe Logo"
        style={{ 
          width: size,
          height: 'auto',
          objectFit: 'contain'
        }}
        className="transition-transform duration-300 hover:scale-105"
      />
      {showTagline && (
        <div className="mt-4 text-sm font-assistant text-gray-600 rtl">
          חוסכים • לומדים • מרוויחים
        </div>
      )}
    </div>
  );
};