import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { FiUser } from 'react-icons/fi'; // Import FiUser as a potential default

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: React.ReactNode; // Can be an icon or initials
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
  const [imageError, setImageError] = useState(false);

  const sizeMap = {
    sm: { dimension: 32, textClass: 'text-sm', iconSize: 16 },
    md: { dimension: 40, textClass: 'text-base', iconSize: 20 },
    lg: { dimension: 64, textClass: 'text-xl', iconSize: 32 },
    xl: { dimension: 128, textClass: 'text-3xl', iconSize: 64 }
  };

  const { dimension, textClass, iconSize } = sizeMap[size];

  // Determine the fallback content
  let fallbackContent = fallback;
  if (!fallbackContent) {
    // If no explicit fallback prop is given, default to FiUser icon.
    // Initials generation is removed as per user request to prefer icon.
    fallbackContent = <FiUser size={iconSize} />;
  }
  
  // Reset imageError state if src changes
  useEffect(() => {
    setImageError(false);
  }, [src]);

  const shouldUseFallback = !src || imageError;

  if (shouldUseFallback) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-neutral-800 text-neutral-400',
          // Using explicit style for dimensions to ensure consistency, Tailwind JIT might struggle with dynamic template literals for w/h here
          className
        )}
        style={{ width: dimension, height: dimension }}
      >
        <span className={cn('font-semibold', textClass)}>
          {fallbackContent}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'relative rounded-full overflow-hidden',
        className
      )}
      style={{ width: dimension, height: dimension }}
    >
      <Image
        src={src} // src is guaranteed to be a non-empty string here
        alt={alt}
        width={dimension}
        height={dimension}
        className={'object-cover w-full h-full'} 
        priority={priority}
        onError={() => {
          console.warn(`Avatar image failed to load: ${src}`);
          setImageError(true); // Set error state to true to trigger fallback render
        }}
      />
    </div>
  );
} 