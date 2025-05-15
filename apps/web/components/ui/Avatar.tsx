import React from 'react';
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
  
  // If src is explicitly null or undefined, or an empty string, use fallback.
  const shouldUseFallback = !src;

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
        onError={(e) => {
          // Optional: More sophisticated error handling, e.g., try to load a different default image
          // For now, if NextImage errors, it might show its own broken image icon or alt text.
          // This component currently doesn't switch to fallback *after* an Image load error.
          console.warn(`Avatar image failed to load: ${src}`);
        }}
      />
    </div>
  );
} 