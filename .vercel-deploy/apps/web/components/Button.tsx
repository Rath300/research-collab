import React from 'react';
import { 
  TouchableOpacity, 
  TouchableOpacityProps, 
  Text, 
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { styled } from '@tamagui/core';
import Link from 'next/link';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
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
  type,
  ...props
}: ButtonProps) {
  const buttonStyles = getButtonStyles(variant, size, fullWidth, disabled);
  
  const content = (
    <>
      {isLoading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? '#FFD700' : '#000000'}
          style={{ marginRight: 8 }}
        />
      )}
      {!isLoading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      {typeof children === 'string' ? (
        <Text style={styles.buttonText}>{children}</Text>
      ) : (
        children
      )}
      {!isLoading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} passHref>
        <TouchableOpacity
          disabled={disabled || isLoading}
          className={buttonStyles}
          accessibilityRole="link"
          onPress={onClick}
          {...props}
        >
          {content}
        </TouchableOpacity>
      </Link>
    );
  }

  return (
    <TouchableOpacity
      disabled={disabled || isLoading}
      className={buttonStyles}
      accessibilityRole="button"
      onPress={onClick}
      {...props}
    >
      {content}
    </TouchableOpacity>
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

const styles = StyleSheet.create({
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} passHref>
        <TouchableOpacity
          disabled={disabled || isLoading}
          className={buttonStyles}
          accessibilityRole="link"
          onPress={onClick}
          {...props}
        >
          {content}
        </TouchableOpacity>
      </Link>
    );
  }

  return (
    <TouchableOpacity
      disabled={disabled || isLoading}
      className={buttonStyles}
      accessibilityRole="button"
      onPress={onClick}
      {...props}
    >
      {content}
    </TouchableOpacity>
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

const styles = StyleSheet.create({
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} passHref>
        <TouchableOpacity
          disabled={disabled || isLoading}
          className={buttonStyles}
          accessibilityRole="link"
          onPress={onClick}
          {...props}
        >
          {content}
        </TouchableOpacity>
      </Link>
    );
  }

  return (
    <TouchableOpacity
      disabled={disabled || isLoading}
      className={buttonStyles}
      accessibilityRole="button"
      onPress={onClick}
      {...props}
    >
      {content}
    </TouchableOpacity>
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

const styles = StyleSheet.create({
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  leftIcon,
  rightIcon,
  disabled = false,
  className = '',
}: ButtonProps) {
  
  const baseClasses = 'netflix-btn flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'netflix-btn-primary',
    secondary: 'netflix-btn-secondary',
    outline: 'netflix-btn-outline',
    danger: 'netflix-btn-danger',
  };
  
  const sizeClasses = {
    small: 'netflix-btn-sm',
    medium: '',
    large: 'netflix-btn-lg',
  };
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;
  
  const handleClick = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };
  
  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled}
    >
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
} 