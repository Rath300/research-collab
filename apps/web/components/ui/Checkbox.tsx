'use client';

import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // We can extend with Tamagui props later or use Tamagui's Checkbox directly
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  CheckboxProps
>(({ className, onCheckedChange, checked, ...props }, ref) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange) {
      onCheckedChange(event.target.checked);
    }
  };

  return (
    <input
      type="checkbox"
      ref={ref}
      className={`h-4 w-4 rounded border-neutral-600 text-accent-purple focus:ring-accent-purple ${className}`}
      checked={checked}
      onChange={handleChange}
      {...props}
    />
  );
});

Checkbox.displayName = 'Checkbox'; 
 
 
 