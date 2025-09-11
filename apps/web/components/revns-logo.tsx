import React from 'react';
import { cn } from '@repo/ui/lib/utils';
import { ChevronsUp } from 'lucide-react';

type LogoSize = 'small' | 'default' | 'large' | 'extra';

interface RevNSLogoProps {
  className?: string;
  size?: LogoSize;
}

const sizes: Record<LogoSize, string> = {
  small: "h-8",
  default: "h-10",
  large: "h-12",
  extra:'h-20'
};

const RevNSLogo: React.FC<RevNSLogoProps> = ({ 
  className, 
  size = "default" 
}) => (
  <div className={cn(
    "inline-flex items-center justify-center",
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
   ExplainX
  </div>
);

export default RevNSLogo;