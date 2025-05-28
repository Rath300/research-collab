import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isFullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 
      'inline-flex items-center justify-center rounded-lg font-semibold tracking-wide '
      + 'transition-all duration-300 ease-in-out focus-visible:outline-none '
      + 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent '
      + 'disabled:opacity-60 disabled:pointer-events-none';
    
    const variantStyles = {
      primary: 
        'bg-gradient-to-r from-purple-600 to-pink-500 text-white '
        + 'hover:from-purple-700 hover:to-pink-600 shadow-lg hover:shadow-xl '
        + 'focus-visible:ring-purple-500',
      secondary: 
        'bg-gray-700/50 text-gray-100 hover:bg-gray-600/70 backdrop-blur-sm border border-gray-600/80 '
        + 'focus-visible:ring-gray-400',
      accent: 
        'bg-gradient-to-r from-researchbee-yellow to-orange-500 text-black '
        + 'hover:from-researchbee-yellow-dark hover:to-orange-600 shadow-md hover:shadow-lg '
        + 'focus-visible:ring-researchbee-yellow',
      outline: 
        'border border-white/30 bg-white/5 text-gray-100 backdrop-blur-sm '
        + 'hover:bg-white/10 hover:border-white/50 hover:text-white '
        + 'focus-visible:ring-white/70',
      ghost: 
        'bg-transparent text-gray-200 hover:bg-white/10 hover:text-white '
        + 'focus-visible:ring-gray-400',
      danger: 
        'bg-red-500/70 border border-red-500/90 text-white backdrop-blur-sm '
        + 'hover:bg-red-600/80 hover:border-red-600 '
        + 'focus-visible:ring-red-400',
      glass:
        'bg-white/10 backdrop-blur-md border border-white/20 text-white '
        + 'hover:bg-white/20 hover:border-white/30 shadow-lg '
        + 'focus-visible:ring-white/50',
    };
    
    const sizeStyles = {
      sm: 'px-3.5 py-2 text-xs h-9',
      md: 'px-5 py-2.5 text-sm h-10',
      lg: 'px-6 py-3 text-base h-12',
    };
    
    const fullWidthStyles = isFullWidth ? 'w-full' : '';
    
    return (
      <button
        ref={ref}
        className={twMerge(
          clsx(
            baseStyles,
            variantStyles[variant],
            sizeStyles[size],
            fullWidthStyles,
            isLoading ? 'opacity-75 cursor-not-allowed' : '',
            className
          )
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        
        {!isLoading && leftIcon && <span className={children ? "mr-2" : ""}>{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className={children ? "ml-2" : ""}>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button'; 