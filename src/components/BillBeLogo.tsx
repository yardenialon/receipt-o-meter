import React from 'react';

export const BillBeLogo = ({ className = "", size = 200 }: { className?: string, size?: number }) => {
  // Calculate height based on original SVG aspect ratio (120/400 = 0.3)
  const height = size * 0.3;

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 400 120"
      width={size}
      height={height}
      className={className}
      style={{ background: 'transparent' }}
    >
      <rect width="100%" height="100%" fill="none"/>
      
      {/* Icon: Stylized receipt with checkmark */}
      <g transform="translate(20, 10)">
        {/* Receipt base shape */}
        <path 
          d="M35 10 L65 10 L65 70 L58 65 L50 70 L42 65 L35 70 Z" 
          fill="none" 
          stroke="#47d193" 
          strokeWidth="3"
        />
        
        {/* Receipt lines */}
        <line x1="42" y1="25" x2="58" y2="25" stroke="#47d193" strokeWidth="2"/>
        <line x1="42" y1="35" x2="58" y2="35" stroke="#47d193" strokeWidth="2"/>
        <line x1="42" y1="45" x2="58" y2="45" stroke="#47d193" strokeWidth="2"/>
        
        {/* Checkmark circle */}
        <circle cx="50" cy="40" r="25" fill="#47d193" opacity="0.1"/>
        
        {/* Checkmark */}
        <path 
          d="M40 40 L48 48 L60 32" 
          fill="none" 
          stroke="#47d193" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </g>
      
      {/* Text BillBe */}
      <text 
        x="110" 
        y="65" 
        fontFamily="Montserrat, Arial, sans-serif" 
        fontSize="54" 
        fontWeight="600" 
        letterSpacing="1"
      >
        <tspan fill="#47d193">Bill</tspan>
        <tspan fill="#47d193" opacity="0.8">Be</tspan>
      </text>
      
      {/* Tagline in Hebrew */}
      <text 
        x="113" 
        y="85" 
        fontFamily="Noto Sans Hebrew, Arial, sans-serif" 
        fontSize="14" 
        fill="#47d193" 
        opacity="0.6"
      >
        תובנות חכמות לניהול הוצאות
      </text>
    </svg>
  );
};