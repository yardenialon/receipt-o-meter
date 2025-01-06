import React from 'react';

interface BillBeLogoProps {
  size?: number;
  className?: string;
}

export const SavvyLogo: React.FC<BillBeLogoProps> = ({ size = 150, className = '' }) => {
  return (
    <img 
      src="/lovable-uploads/0b91faef-306a-433e-ab3e-ce812ecd1151.png"
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