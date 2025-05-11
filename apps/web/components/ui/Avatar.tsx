import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: React.ReactNode;
  className?: string;
  priority?: boolean; // Optional: allow high priority loading for critical avatars
}

export function Avatar({ 
  src, 
  alt, 
  size = 'md', 
  fallback, 
  className, 
  priority = false 
}: AvatarProps) {
  const sizeMap = {
    sm: { dimension: 32, textClass: 'text-sm' },
    md: { dimension: 40, textClass: 'text-base' },
    lg: { dimension: 64, textClass: 'text-xl' },
    xl: { dimension: 128, textClass: 'text-3xl' }
  };

  const { dimension, textClass } = sizeMap[size];

  if (!src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700',
          `w-${dimension / 4} h-${dimension / 4}`, // Use Tailwind's spacing scale if possible or direct style
          `min-w-[${dimension}px] min-h-[${dimension}px] w-[${dimension}px] h-[${dimension}px]`,
          className
        )}
        style={{ width: dimension, height: dimension }} // Ensure exact dimensions for fallback
      >
        <span className={cn('font-semibold text-gray-500 dark:text-gray-400', textClass)}>
          {fallback || alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'relative rounded-full overflow-hidden',
        `w-${dimension / 4} h-${dimension / 4}`, // Tailwind JIT might need specific pixel values here
        `min-w-[${dimension}px] min-h-[${dimension}px] w-[${dimension}px] h-[${dimension}px]`,
        className
      )}
      style={{ width: dimension, height: dimension }} // Ensure wrapper has dimensions
    >
      <Image
        src={src}
        alt={alt}
        width={dimension}
        height={dimension}
        className={'object-cover'} // next/image handles its own styling primarily, ensure cover
        priority={priority}
        // You might need to configure remotePatterns in next.config.js if using external image URLs
      />
    </div>
  );
} 