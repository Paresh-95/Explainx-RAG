import React from 'react';
import { cn } from '@repo/ui/lib/utils';

type LogoSize = 'small' | 'default' | 'large';

interface RevNSLogoProps {
  className?: string;
  size?: LogoSize;
}

const sizes: Record<LogoSize, string> = {
  small: "h-8",
  default: "h-10",
  large: "h-12"
};

const RevNSLogoWithText: React.FC<RevNSLogoProps> = ({ 
  className, 
  size = "default" 
}) => (
  <div className={cn(
    "inline-flex items-center gap-3",
    sizes[size],
    className
  )}>
    <svg 
      viewBox="0 0 24 24" 
      className="h-full w-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background neural network grid */}
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        className="stroke-primary/[0.15] dark:stroke-primary/20" 
        strokeWidth="0.75"
      />
      <path 
        d="M6 6 L18 18 M18 6 L6 18" 
        className="stroke-primary/[0.15] dark:stroke-primary/20" 
        strokeWidth="0.75"
      />
      <path 
        d="M12 2 L12 22 M2 12 L22 12" 
        className="stroke-primary/[0.15] dark:stroke-primary/20" 
        strokeWidth="0.75"
      />

      {/* Main analytics line */}
      <path 
        d="M4 16 L8 12 L12 14 L16 8 L20 6" 
        className="stroke-primary dark:stroke-primary" 
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Neural network nodes */}
      <circle 
        cx="8" 
        cy="12" 
        r="2" 
        className="fill-primary dark:fill-primary"
      />
      <circle 
        cx="12" 
        cy="14" 
        r="2" 
        className="fill-primary dark:fill-primary"
      />
      <circle 
        cx="16" 
        cy="8" 
        r="2" 
        className="fill-primary dark:fill-primary"
      />

      {/* AI connection paths */}
      <path 
        d="M8 12 L12 14 L16 8" 
        className="stroke-primary/40 dark:stroke-primary/50" 
        strokeWidth="1"
      />
      
      {/* AI pulse rings */}
      <circle 
        cx="12" 
        cy="14" 
        r="3" 
        className="stroke-primary/25 dark:stroke-primary/30"
        strokeWidth="0.75"
      >
        <animate
          attributeName="r"
          values="2.5;3.5;2.5"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.25;0.1;0.25"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
    <span className="font-semibold tracking-wide text-lg bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
      REVNS
    </span>
  </div>
);

export default RevNSLogoWithText;