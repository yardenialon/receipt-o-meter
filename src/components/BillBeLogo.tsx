import React from 'react';

export const BillBeLogo = ({ className = "", size = 200 }: { className?: string, size?: number }) => {
  return (
    <img 
      src="/lovable-uploads/f6b5d63b-6a6f-4ed4-a15f-4a3cda68e9db.png"
      alt="Bill Be Logo"
      style={{ width: size, height: 'auto' }}
      className={className}
    />
  );
};