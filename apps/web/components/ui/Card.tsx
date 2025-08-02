import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  as?: React.ElementType;
}

export const Card = ({ children, className, hoverEffect = false, as: Component = 'div' }: CardProps) => {
  return (
    <Component
      className={twMerge(
        'rounded-lg bg-surface-primary border border-border-medium',
        'p-4',
        hoverEffect && 'transition-all duration-200 hover:border-border-dark hover:bg-surface-hover',
        className
      )}
    >
      {children}
    </Component>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader = ({ children, className }: CardHeaderProps) => {
  return (
    <div className={twMerge('pb-3 mb-3 border-b border-border-light', className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle = ({ children, className }: CardTitleProps) => {
  return (
    <h3 className={twMerge('text-base font-heading font-medium text-text-primary', className)}>
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription = ({ children, className }: CardDescriptionProps) => {
  return (
    <p className={twMerge('text-xs text-text-secondary font-body leading-normal', className)}>
      {children}
    </p>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent = ({ children, className }: CardContentProps) => {
  return (
    <div className={twMerge('', className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter = ({ children, className }: CardFooterProps) => {
  return (
    <div className={twMerge('pt-3 mt-3 border-t border-border-light flex items-center', className)}>
      {children}
    </div>
  );
}; 