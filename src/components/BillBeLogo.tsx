import React from 'react';

export const BillBeLogo = ({ className = "", size = 24 }: { className?: string, size?: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Face */}
      <circle cx="12" cy="12" r="6" />
      
      {/* Smile */}
      <path d="M10 14a2,2 0 0,0 4,0" />
      
      {/* Eyes */}
      <circle cx="10" cy="11" r="0.5" fill="currentColor" />
      <circle cx="14" cy="11" r="0.5" fill="currentColor" />
      
      {/* Pigtails */}
      <path d="M7 8c-2,-2 -2,-4 0,-5" />
      <path d="M17 8c2,-2 2,-4 0,-5" />
      
      {/* Hair bands */}
      <circle cx="7" cy="8" r="0.5" fill="currentColor" />
      <circle cx="17" cy="8" r="0.5" fill="currentColor" />
    </svg>
  );
};