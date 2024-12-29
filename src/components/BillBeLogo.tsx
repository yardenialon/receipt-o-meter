import React from 'react';
import { cn } from '@/lib/utils';

interface BillBeLogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'icon' | 'vertical';
  showTagline?: boolean;
}

export const BillBeLogo = ({ 
  className = "", 
  size = 200, 
  variant = 'full',
  showTagline = false 
}: BillBeLogoProps) => {
  return (
    <div className={cn("inline-flex flex-col items-center", className)} style={{ width: size }}>
      <svg
        viewBox="0 0 400 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "w-full h-auto",
          variant === 'icon' && "hidden",
          variant === 'vertical' && "transform scale-150"
        )}
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#34D399' }} />
            <stop offset="100%" style={{ stopColor: '#1E40AF' }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Icon - Stylized B with Growth Arrow */}
        <g filter="url(#glow)">
          <path
            d="M60 20 
               C60 20, 80 20, 90 30
               C100 40, 100 60, 90 70
               C80 80, 60 80, 60 80
               L60 100
               L40 100
               L40 20
               Z"
            fill="url(#logoGradient)"
            className="animate-pulse"
          />
          {/* Growth Arrow */}
          <path
            d="M70 50 L90 50 L80 30 L70 50"
            fill="#34D399"
            className="animate-bounce"
          />
        </g>

        {/* Text - BILL BE */}
        <text
          x="120"
          y="65"
          className="font-bold tracking-wider"
          style={{ 
            fontSize: '48px',
            fontFamily: 'Inter, sans-serif'
          }}
          fill="#1E40AF"
        >
          BILL
          <tspan
            x="250"
            className="font-medium"
            fill="#34D399"
          >
            BE
          </tspan>
        </text>
      </svg>

      {/* Icon-only variant */}
      {variant === 'icon' && (
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <use href="#icon" />
        </svg>
      )}

      {/* Tagline */}
      {showTagline && (
        <div className="mt-2 text-sm font-assistant text-gray-600 rtl">
          חוסכים • לומדים • מרוויחים
        </div>
      )}
    </div>
  );
};