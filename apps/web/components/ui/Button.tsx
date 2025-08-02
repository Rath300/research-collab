import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
      'inline-flex items-center justify-center rounded-lg font-ui font-medium tracking-wide '
      + 'transition-all duration-200 ease-in-out focus-visible:outline-none '
      + 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary '
      + 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';
    
    const variantStyles = {
      primary: 
        'bg-accent-primary text-text-inverse shadow-sm '
        + 'hover:bg-accent-primary-hover hover:shadow-md '
        + 'focus-visible:ring-accent-primary',
      secondary: 
        'bg-surface-primary text-text-primary border border-border-medium '
        + 'hover:bg-surface-hover focus-visible:ring-accent-primary',
      accent: 
        'bg-accent-secondary text-text-inverse shadow-sm '
        + 'hover:bg-accent-secondary-hover hover:shadow-md '
        + 'focus-visible:ring-accent-secondary',
      outline: 
        'border border-border-medium bg-transparent text-text-primary '
        + 'hover:bg-surface-hover hover:border-border-dark '
        + 'focus-visible:ring-accent-primary',
      ghost: 
        'bg-transparent text-text-primary '
        + 'hover:bg-surface-hover focus-visible:ring-accent-primary',
      danger: 
        'bg-accent-error text-text-inverse shadow-sm '
        + 'hover:bg-red-700 hover:shadow-md '
        + 'focus-visible:ring-accent-error',
      glass:
        'bg-surface-primary/80 backdrop-blur-md border border-border-light text-text-primary '
        + 'hover:bg-surface-primary hover:border-border-medium shadow-lg '
        + 'focus-visible:ring-accent-primary',
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