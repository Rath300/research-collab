'use client';

import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  // We can extend with Tamagui props later or use Tamagui's Label directly
}

export const Label = React.forwardRef<
  HTMLLabelElement,
  LabelProps
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    />
  );
});

Label.displayName = 'Label'; 
 
 
 
 