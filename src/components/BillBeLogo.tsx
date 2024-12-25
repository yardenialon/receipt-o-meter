import React from 'react';

export const BillBeLogo = ({ className = "", size = 24, showText = true }: { className?: string, size?: number, showText?: boolean }) => {
  const scale = size / 100;
  const viewBoxWidth = showText ? 400 : 100;
  
  return (
    <svg
      width={size * (showText ? 4 : 1)}
      height={size}
      viewBox={`0 0 ${viewBoxWidth} 120`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {showText && (
        <>
          {/* Text BillBe */}
          <text 
            x={20 * scale} 
            y={65 * scale} 
            fontFamily="Montserrat, Arial, sans-serif" 
            fontSize={54 * scale} 
            fontWeight="600" 
            letterSpacing="1"
          >
            <tspan fill="currentColor">Bill</tspan>
            <tspan fill="currentColor" opacity="0.8">Be</tspan>
          </text>
          
          {/* Tagline in Hebrew */}
          <text 
            x={23 * scale} 
            y={85 * scale} 
            fontFamily="Noto Sans Hebrew, Arial, sans-serif" 
            fontSize={14 * scale} 
            fill="currentColor" 
            opacity="0.6"
          >
            תובנות חכמות לניהול הוצאות
          </text>
        </>
      )}

      {/* Icon: Stylized receipt with checkmark */}
      <g transform={`translate(${showText ? 280 : 20}, 10) scale(${scale})`}>
        {/* Receipt base shape */}
        <path 
          d="M35 10 L65 10 L65 70 L58 65 L50 70 L42 65 L35 70 Z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
        />
        
        {/* Receipt lines */}
        <line x1="42" y1="25" x2="58" y2="25" stroke="currentColor" strokeWidth="2"/>
        <line x1="42" y1="35" x2="58" y2="35" stroke="currentColor" strokeWidth="2"/>
        <line x1="42" y1="45" x2="58" y2="45" stroke="currentColor" strokeWidth="2"/>
        
        {/* Checkmark circle */}
        <circle cx="50" cy="40" r="25" fill="currentColor" opacity="0.1"/>
        
        {/* Checkmark */}
        <path 
          d="M40 40 L48 48 L60 32" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};