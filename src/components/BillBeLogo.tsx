import React from 'react';

interface BillBeLogoProps {
  size?: number;
  className?: string;
}

export const BillBeLogo: React.FC<BillBeLogoProps> = ({ size = 150, className = '' }) => {
  return (
    <img 
      src="/lovable-uploads/d93c25df-9c2b-4fa3-ab6d-e0cb1b47de5d.png"
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