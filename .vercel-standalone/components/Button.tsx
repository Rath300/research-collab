import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  href,
  children,
  onClick,
  type = 'button',
  ...props
}: ButtonProps) {
  const buttonStyles = getButtonStyles(variant, size, fullWidth, disabled);
  
  const content = (
    <>
      {isLoading && (
        <div className="mr-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {!isLoading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} passHref>
        <button
          disabled={disabled || isLoading}
          className={buttonStyles}
          onClick={onClick}
          type={type}
          {...props}
        >
          {content}
        </button>
      </Link>
    );
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={buttonStyles}
      onClick={onClick}
      type={type}
      {...props}
    >
      {content}
    </button>
  );
}

function getButtonStyles(
  variant: 'primary' | 'secondary' | 'outline' | 'danger',
  size: 'small' | 'medium' | 'large',
  fullWidth: boolean,
  disabled?: boolean
): string {
  const baseStyles = 'flex flex-row items-center justify-center rounded-lg transition-colors';
  const widthStyles = fullWidth ? 'w-full' : '';
  
  let sizeStyles = '';
  switch (size) {
    case 'small':
      sizeStyles = 'px-3 py-1.5 text-sm';
      break;
    case 'large':
      sizeStyles = 'px-6 py-3 text-lg';
      break;
    default:
      sizeStyles = 'px-4 py-2';
  }
  
  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = disabled
        ? 'bg-gray-500 text-gray-300'
        : 'bg-researchbee-yellow text-black hover:bg-yellow-500 active:bg-yellow-600';
      break;
    case 'secondary':
      variantStyles = disabled
        ? 'bg-gray-700 text-gray-400'
        : 'bg-researchbee-medium-gray text-white hover:bg-gray-600 active:bg-gray-700';
      break;
    case 'outline':
      variantStyles = disabled
        ? 'border border-gray-600 text-gray-400'
        : 'border border-researchbee-yellow text-researchbee-yellow hover:bg-researchbee-yellow/10 active:bg-researchbee-yellow/20';
      break;
    case 'danger':
      variantStyles = disabled
        ? 'bg-red-900 text-red-300'
        : 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800';
      break;
  }
  
  return `${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyles}`;
} 