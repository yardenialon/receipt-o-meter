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
        src="/lovable-uploads/1f5589fb-c108-45ce-b235-a61909f72471.png"
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