import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isFullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperTextClassName?: string;
  errorClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      isFullWidth = false,
      size = 'md',
      className,
      containerClassName,
      labelClassName,
      inputClassName,
      helperTextClassName,
      errorClassName,
      ...props
    },
    ref
  ) => {
    const baseInputStyles = 'bg-gray-900 border text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100 dark:placeholder-gray-600';
    
    const sizeStyles = {
      sm: 'py-1 text-xs rounded',
      md: 'py-2 text-sm rounded-md',
      lg: 'py-2.5 text-base rounded-md',
    };
    
    const iconSizeStyles = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-5 w-5',
    };
    
    const paddingWithIconStyles = {
      left: {
        sm: 'pl-7',
        md: 'pl-9',
        lg: 'pl-10',
      },
      right: {
        sm: 'pr-7',
        md: 'pr-9',
        lg: 'pr-10',
      },
    };
    
    let horizontalPadding = 'px-3';
    if (leftIcon) {
      horizontalPadding = paddingWithIconStyles.left[size];
    }
    if (rightIcon) {
      horizontalPadding = paddingWithIconStyles.right[size];
    }
    if (leftIcon && rightIcon) {
      horizontalPadding = `${paddingWithIconStyles.left[size]} ${paddingWithIconStyles.right[size]}`;
    }
    
    const widthStyle = isFullWidth ? 'w-full' : '';
    const validationStyle = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 dark:border-gray-800';
    
    return (
      <div className={twMerge('flex flex-col', widthStyle, containerClassName)}>
        {label && (
          <label 
            htmlFor={props.id} 
            className={twMerge(
              'block text-sm font-medium text-gray-200 dark:text-gray-300 mb-1',
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
              <span className={iconSizeStyles[size]}>
                {leftIcon}
              </span>
            </div>
          )}
          
          <input
            ref={ref}
            className={twMerge(
              baseInputStyles,
              sizeStyles[size],
              horizontalPadding,
              validationStyle,
              widthStyle,
              inputClassName,
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
              <span className={iconSizeStyles[size]}>
                {rightIcon}
              </span>
            </div>
          )}
        </div>
        
        {error && (
          <p 
            className={twMerge(
              'mt-1 text-xs text-red-400 dark:text-red-400',
              errorClassName
            )}
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p 
            className={twMerge(
              'mt-1 text-xs text-gray-400 dark:text-gray-500',
              helperTextClassName
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; 