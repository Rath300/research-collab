'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SpinnerProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const sizeClasses = {
  small: 'h-4 w-4 border-2',
  medium: 'h-6 w-6 border-2',
  large: 'h-8 w-8 border-3',
};

export function Spinner({ className, size = 'medium' }: SpinnerProps) {
  return (
    <div
      className={twMerge(
        'animate-spin-fast rounded-full border-solid border-primary-600 border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="loading"
    />
  );
}

export default Spinner; 