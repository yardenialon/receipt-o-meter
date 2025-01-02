import React from 'react';

interface BillBeLogoProps {
  size?: number;
  className?: string;
}

export const BillBeLogo: React.FC<BillBeLogoProps> = ({ size = 150, className = '' }) => {
  return (
    <img 
      src="/lovable-uploads/2ec9e748-cf82-409e-a66f-89308a4585b2.png"
      alt="Savvy Logo"
      style={{ 
        width: size,
        height: 'auto',
        objectFit: 'contain'
      }}
      className={className}
    />
  );
};