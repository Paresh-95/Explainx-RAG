import React from 'react';
import { cn } from '@repo/ui/lib/utils';
import { ChevronsUp } from 'lucide-react';

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
      <span className="block dark:hidden">
        <img
          src="/assets/logo-light.png"
          alt="ExplainX Logo"
          className="w-8 h-8"
          width={32}
          height={32}
        />
      </span>
      <span className="hidden dark:block">
        <img
          src="/assets/logo-dark.png"
          alt="ExplainX Logo"
          className="w-8 h-8"
          width={32}
          height={32}
        />
      </span>

  
    <span className="font-semibold tracking-wide text-lg bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
      ExplainX
    </span>
  </div>
);

export default RevNSLogoWithText;