import React from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { cn } from '@repo/ui/lib/utils';

// Custom variant for dashed button
const DashedButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    className?: string;
  }
>(({ className, children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 px-4 py-3 h-auto text-left",
        "border-2 border-dashed border-gray-600 hover:border-gray-500",
        "text-gray-200 hover:text-white hover:bg-gray-700/50",
        "rounded-lg transition-all duration-200",
        "bg-transparent",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
});
DashedButton.displayName = "DashedButton";

// Alternative using Button with custom classes directly
interface DashedButtonDirectProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const DashedButtonDirect = ({ children, className, ...props }: DashedButtonDirectProps) => (
  <Button
    variant="ghost"
    className={cn(
      "w-full justify-start gap-3 px-3 py-2 h-auto text-left",
      "border-2 border-dashed border-gray-600 hover:border-gray-500",
      "text-gray-200 hover:text-white hover:bg-gray-700/50",
      "rounded-lg transition-all duration-200",
      "bg-transparent",
      className
    )}
    {...props}
  >
    {children}
  </Button>
);
