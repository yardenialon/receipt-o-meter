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
    <div className={cn("inline-flex flex-col items-center", className)} style={{ width: size }}>
      <svg
        viewBox="0 0 400 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Main Text - BILL BE with stripes effect */}
        <g className="text-primary-500">
          {/* B */}
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={`b1-${i}`}
              d={`M${40 + i * 8} 20h20v80h-20z`}
              fill="currentColor"
            />
          ))}
          {/* I */}
          {[0, 1, 2].map((i) => (
            <path
              key={`i1-${i}`}
              d={`M${120 + i * 8} 20h20v80h-20z`}
              fill="currentColor"
            />
          ))}
          {/* L */}
          {[0, 1, 2, 3].map((i) => (
            <path
              key={`l1-${i}`}
              d={`M${180 + i * 8} 20h20v80h-20z`}
              fill="currentColor"
            />
          ))}
          {/* L */}
          {[0, 1, 2, 3].map((i) => (
            <path
              key={`l2-${i}`}
              d={`M${240 + i * 8} 20h20v80h-20z`}
              fill="currentColor"
            />
          ))}
          {/* B */}
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={`b2-${i}`}
              d={`M${300 + i * 8} 20h20v80h-20z`}
              fill="currentColor"
            />
          ))}
          {/* E */}
          {[0, 1, 2, 3].map((i) => (
            <path
              key={`e-${i}`}
              d={`M${360 + i * 8} 20h20v80h-20z`}
              fill="currentColor"
            />
          ))}
        </g>

        {/* Barcode effect */}
        <g transform="translate(40, 110)">
          {Array.from({ length: 30 }).map((_, i) => (
            <rect
              key={`barcode-${i}`}
              x={i * 10}
              y="0"
              width="4"
              height={Math.random() * 20 + 10}
              fill="#666"
              opacity="0.8"
            />
          ))}
        </g>
      </svg>

      {/* Tagline */}
      {showTagline && (
        <div className="mt-4 text-sm font-assistant text-gray-600 rtl">
          חוסכים • לומדים • מרוויחים
        </div>
      )}
    </div>
  );
};